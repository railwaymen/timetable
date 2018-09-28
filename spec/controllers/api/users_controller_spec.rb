# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::UsersController do
  render_views
  let(:user) { create(:user) }
  let(:admin) { create(:admin) }
  let(:manager) { create(:manager) }
  let(:first_name) { SecureRandom.hex }
  let(:last_name) { SecureRandom.hex }
  let(:email) { "#{SecureRandom.hex}@example.com" }

  def user_response(user)
    user.attributes.slice('email', 'first_name', 'last_name', 'active', 'lang')
  end

  describe '#index' do
    it 'authenticates user' do
      get :index, format: :json
      expect(response.code).to eql('401')
    end

    it 'authenticates user' do
      sign_in(user)
      get :index, format: :json
      expect(response.code).to eql('403')
    end

    it 'returns users' do
      sign_in(manager)
      user = create(:user)
      get :index, format: :json

      expect(response.code).to eql('200')
      expect(response.body).to be_json_eql([user_response(manager), user_response(user)].to_json)
    end

    describe 'filters' do
      context 'all' do
        it 'return all possible records' do
          sign_in admin
          FactoryGirl.create :user, active: false
          FactoryGirl.create :user, active: true

          get :index, params: { filter: 'all' }, format: :json

          expected_json = User.all.map do |user|
            {
              id: user.id,
              first_name: user.first_name,
              last_name: user.last_name,
              email: user.email,
              lang: user.lang,
              active: user.active,
              phone: user.phone,
              contract_name: user.contract_name
            }
          end.to_json

          expect(response.body).to eq expected_json
        end
      end

      context 'active' do
        it 'return all possible records' do
          sign_in admin
          FactoryGirl.create :user, active: false
          FactoryGirl.create :user, active: true

          get :index, params: { filter: 'active' }, format: :json

          expected_json = User.where(active: true).map do |user|
            {
              id: user.id,
              first_name: user.first_name,
              last_name: user.last_name,
              email: user.email,
              lang: user.lang,
              active: user.active,
              phone: user.phone,
              contract_name: user.contract_name
            }
          end.to_json

          expect(response.body).to eq expected_json
        end
      end

      context 'inactive' do
        it 'return all possible records' do
          sign_in admin
          FactoryGirl.create :user, active: false
          FactoryGirl.create :user, active: true

          get :index, params: { filter: 'inactive' }, format: :json

          expected_json = User.where(active: false).map do |user|
            {
              id: user.id,
              first_name: user.first_name,
              last_name: user.last_name,
              email: user.email,
              lang: user.lang,
              active: user.active,
              phone: user.phone,
              contract_name: user.contract_name
            }
          end.to_json

          expect(response.body).to eq expected_json
        end
      end
    end
  end

  describe '#show' do
    it 'authenticates user' do
      get :show, params: { id: 1 }, format: :json
      expect(response.code).to eql('401')
    end

    it 'returns user' do
      sign_in(user)
      user = create(:user)
      get :show, params: { id: user.id }, format: :json
      expect(response.code).to eql('200')
      expect(response.body).to be_json_eql(user_response(user).to_json)
    end
  end

  describe '#create' do
    it 'authenticates user' do
      post :create, format: :json
      expect(response.code).to eql('401')
    end

    it 'authorizes admin' do
      sign_in(user)
      post :create, format: :json
      expect(response.code).to eql('403')
    end

    it 'authorizes admin' do
      sign_in(manager)
      post :create, format: :json
      expect(response.code).to eql('403')
    end

    it 'creates project as admin' do
      sign_in(admin)
      post :create, params: { user: { first_name: first_name, last_name: last_name, email: email } }, format: :json
      expect(response.code).to eql('201')
      user = User.find_by email: email
      expect(response.body).to be_json_eql(user.to_json)
    end
  end

  describe '#update' do
    it 'authenticates user' do
      put :update, params: { id: 1 }, format: :json
      expect(response.code).to eql('401')
    end

    it 'authorizes admin' do
      sign_in(user)
      put :update, params: { id: 1 }, format: :json
      expect(response.code).to eql('403')
    end

    it 'authorizes admin' do
      sign_in(manager)
      put :update, params: { id: 1 }, format: :json
      expect(response.code).to eql('403')
    end

    it 'updates user as admin' do
      sign_in(admin)
      user = create(:user)
      put :update, params: { id: user.id, user: { first_name: first_name, last_name: last_name, email: email } }, format: :json
      expect(response.code).to eql('204')
      expect(user.reload.first_name).to eql(first_name)
      expect(user.last_name).to eql(last_name)
      expect(user.email).to eql(email)
      expect(response.body).to eq('')
    end
  end
end
