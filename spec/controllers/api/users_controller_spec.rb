# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::UsersController do
  let(:user) { create(:user) }
  let(:admin) { create(:user, :admin) }
  let(:manager) { create(:user, :manager) }
  let(:first_name) { SecureRandom.hex }
  let(:last_name) { SecureRandom.hex }
  let(:email) { "#{SecureRandom.hex}@example.com" }

  def user_response(user)
    user.attributes.slice('id', 'email', 'first_name', 'last_name', 'lang', 'department')
        .merge(active: user.kept?, name: user.name, accounting_name: user.accounting_name,
               position_list: user.tags.pluck(:name))
  end

  def user_response_for_admin(user)
    user_response(user).merge(department: user.department, phone: user.phone, contract_name: user.contract_name)
  end

  describe '#index' do
    it 'authenticates user' do
      get :index, as: :json
      expect(response.code).to eql('401')
    end

    it 'authenticates user' do
      sign_in(user)
      get :index, as: :json
      expect(response.code).to eql('403')
    end

    it 'returns users' do
      manager = create(:user, :manager, contract_name: 'AX1')
      user = create(:user, contract_name: 'ZX1')
      sign_in(manager)
      get :index, as: :json

      expect(response.code).to eql('200')
      expect(response.body).to be_json_eql([user_response(manager), user_response(user)].to_json)
    end

    describe 'filters' do
      context 'all' do
        it 'return all possible records' do
          sign_in admin
          FactoryBot.create :user, :discarded
          FactoryBot.create :user

          get :index, params: { filter: 'all' }, as: :json

          expected_json = User.all.map do |user|
            user_response_for_admin(user)
          end

          expect(response.body).to be_json_eql(expected_json.to_json)
        end
      end

      context 'active' do
        it 'return all possible records' do
          sign_in admin
          FactoryBot.create :user, :discarded
          FactoryBot.create :user

          get :index, params: { filter: 'active' }, as: :json

          expected_json = User.kept.map do |user|
            user_response_for_admin(user)
          end

          expect(response.body).to be_json_eql(expected_json.to_json)
        end
      end

      context 'inactive' do
        it 'return all possible records' do
          sign_in admin
          FactoryBot.create :user, :discarded
          FactoryBot.create :user

          get :index, params: { filter: 'inactive' }, as: :json

          expected_json = User.discarded.map do |user|
            user_response_for_admin(user)
          end

          expect(response.body).to be_json_eql(expected_json.to_json)
        end
      end
    end
  end

  describe '#show' do
    it 'authenticates user' do
      get :show, params: { id: 1 }, as: :json
      expect(response.code).to eql('401')
    end

    it 'returns user' do
      sign_in(user)
      user = create(:user)
      user = User.with_next_and_previous_user_id.find(user.id)
      get :show, params: { id: user.id }, as: :json
      expect(response.code).to eql('200')
      expect(response.body).to be_json_eql(user_response(user).merge(next_id: user.next_id, prev_id: user.prev_id).to_json)
    end
  end

  describe '#create' do
    it 'authenticates user' do
      post :create, as: :json
      expect(response.code).to eql('401')
    end

    it 'authorizes admin' do
      sign_in(user)
      post :create, as: :json
      expect(response.code).to eql('403')
    end

    it 'authorizes admin' do
      sign_in(manager)
      post :create, as: :json
      expect(response.code).to eql('403')
    end

    it 'creates user as admin' do
      sign_in(admin)
      user_params = { first_name: first_name, last_name: last_name, email: email, position_list: ['Junior'], department: :dev }
      post :create, params: { user: user_params }, as: :json
      expect(response.code).to eql('201')
      user = User.find_by email: email
      expect(user.first_name).to eql(first_name)
      expect(user.last_name).to eql(last_name)
      expect(user.department).to eql('dev')
      expect(response.body).to be_json_eql(user.to_json)
    end
  end

  describe '#update' do
    it 'authenticates user' do
      put :update, params: { id: 1 }, as: :json
      expect(response.code).to eql('401')
    end

    it 'authorizes admin' do
      sign_in(user)
      put :update, params: { id: 1 }, as: :json
      expect(response.code).to eql('403')
    end

    it 'authorizes admin' do
      sign_in(manager)
      put :update, params: { id: 1 }, as: :json
      expect(response.code).to eql('403')
    end

    it 'updates user as admin' do
      sign_in(admin)
      user = create(:user)
      user_params = { first_name: first_name, last_name: last_name, email: email, position_list: ['Mid'] }
      put :update, params: { id: user.id, user: user_params }, as: :json
      expect(response.code).to eql('204')
      expect(user.reload.first_name).to eql(first_name)
      expect(user.last_name).to eql(last_name)
      expect(user.email).to eql(email)
      expect(response.body).to eq('')
    end

    it 'user updates themselves' do
      user = create(:user)
      sign_in(user)
      put :update, params: { id: user.id, user: { first_name: first_name, last_name: last_name, email: email } }, as: :json
      expect(response.code).to eql('204')
      expect(user.reload.first_name).to eql(first_name)
      expect(user.last_name).to eql(last_name)
      expect(user.email).to_not eql(email)
      expect(response.body).to eq('')
    end

    it 'changes active as admin' do
      sign_in(admin)
      user = create(:user)
      put :update, params: { id: user.id, user: { active: false } }, as: :json
      expect(response.code).to eql('204')

      expect(user.reload.discarded?).to eql(true)
    end
  end

  describe '#positions' do
    it 'authenticates user' do
      get :positions, as: :json
      expect(response.code).to eql('401')
    end

    it 'checks permissions' do
      sign_in(user)
      get :positions, as: :json
      expect(response.code).to eql('403')
    end

    it 'returns correct values' do
      sign_in(admin)

      create(:tag, name: 'Senior')
      create(:tag, name: 'Mid')
      create(:tag, name: 'Junior')

      get :positions, as: :json
      expect(response.status).to eql(200)
      expect(response.body).to be_json_eql(%w[Junior Mid Senior])
    end
  end
end
