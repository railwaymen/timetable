# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::SessionsController, type: :controller do
  before do
    @request.env['devise.mapping'] = Devise.mappings[:user]
  end

  describe '#create' do
    it 'correctly sign in user and will return token' do
      user = create :user

      post :create, format: :json, params: { user: { email: user.email, password: user.password } }

      token = JSON.parse(response.body)['token']
      decoded_id = JwtService.decode(token: token)['id']
      user_response = user.slice(:id, :first_name, :last_name, :admin, :manager, :staff_manager).merge(
        token: token,
        is_leader: user.leader?
      )

      expect(decoded_id).to eq user.id
      expect(response.code).to eql('200')
      expect(response.body).to be_json_eql(user_response.to_json)
    end

    it 'returns error message for invalid email or password' do
      post :create, format: :json, params: { user: { email: 'aaaa', password: 'aaa' } }

      expected_json = {
        errors: {
          base: [error: :invalid_email_or_password]
        }
      }.to_json

      expect(response.body).to be_json_eql(expected_json)
      expect(response.code).to eq '422'
    end

    it 'returns error message for inactive account' do
      user = create(:user, discarded_at: Time.zone.now)
      post :create, format: :json, params: { user: { email: user.email, password: user.password } }

      expected_json = {
        errors: {
          base: [error: :inactive]
        }
      }.to_json

      expect(response.body).to be_json_eql(expected_json)
      expect(response.code).to eq '422'
    end
  end
end
