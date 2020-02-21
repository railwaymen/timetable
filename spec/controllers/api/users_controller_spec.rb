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
    user.attributes.slice('email', 'first_name', 'last_name', 'prev_id', 'next_id', 'active', 'lang')
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
          FactoryBot.create :user, active: false
          FactoryBot.create :user, active: true

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
              contract_name: user.contract_name,
              birthdate: user.birthdate
            }
          end.to_json

          expect(response.body).to eq expected_json
        end
      end

      context 'active' do
        it 'return all possible records' do
          sign_in admin
          FactoryBot.create :user, active: false
          FactoryBot.create :user, active: true

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
              contract_name: user.contract_name,
              birthdate: user.birthdate
            }
          end.to_json

          expect(response.body).to eq expected_json
        end
      end

      context 'inactive' do
        it 'return all possible records' do
          sign_in admin
          FactoryBot.create :user, active: false
          FactoryBot.create :user, active: true

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
              contract_name: user.contract_name,
              birthdate: user.birthdate
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
      user = User.with_next_and_previous_user_id.find(user.id)
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

  describe '#incoming_birthdays' do
    before do
      allow(Time).to receive(:current).and_return(Time.current.beginning_of_year)
    end

    it 'when all 3 incoming birthdays dates are in the same year' do
      sign_in(admin)
      user1 = create(:user, birthdate: '1995-10-14'.to_date)
      user2 = create(:user, birthdate: '1988-05-10'.to_date)
      user3 = create(:user, birthdate: '1993-07-23'.to_date)

      get :incoming_birthdays, format: :json
      expect(response.status).to eql(200)
      expected_response = {
        incoming_birthdays: [
          { id: user2.id, user_full_name: user2.to_s, birthday_date: "#{user2.birthdate.strftime('%d/%m')}/#{Time.current.year}" },
          { id: user3.id, user_full_name: user3.to_s, birthday_date: "#{user3.birthdate.strftime('%d/%m')}/#{Time.current.year}" },
          { id: user1.id, user_full_name: user1.to_s, birthday_date: "#{user1.birthdate.strftime('%d/%m')}/#{Time.current.year}" }
        ]
      }.to_json
      expect(response.body).to eql(expected_response)
    end

    it 'when all 3 incoming birthdays dates are not in the same year' do
      allow(Time).to receive(:current).and_return(Time.current.end_of_year - 25.days)
      sign_in(admin)
      user1 = create(:user, birthdate: '1995-12-14'.to_date)
      user2 = create(:user, birthdate: '1988-12-25'.to_date)
      user3 = create(:user, birthdate: '1993-01-10'.to_date)

      get :incoming_birthdays, format: :json
      expect(response.status).to eql(200)
      expected_response = {
        incoming_birthdays: [
          { id: user1.id, user_full_name: user1.to_s, birthday_date: "#{user1.birthdate.strftime('%d/%m')}/#{Time.current.year}" },
          { id: user2.id, user_full_name: user2.to_s, birthday_date: "#{user2.birthdate.strftime('%d/%m')}/#{Time.current.year}" },
          { id: user3.id, user_full_name: user3.to_s, birthday_date: "#{user3.birthdate.strftime('%d/%m')}/#{(Time.current + 1.month).year}" }
        ]
      }.to_json
      expect(response.body).to eql(expected_response)
    end
  end
end
