# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::SessionsController, type: :request do
  describe 'create' do
    context 'correct data' do
      it 'correctly sign in user and will return token' do
        user = FactoryGirl.create :user, email: 'example@email.com', password: 'password'

        post '/api/users/sign_in', params: { user: { email: user.email, password: user.password } }

        token = JSON.parse(response.body)['token']
        decoded_id = JwtService.decode(token: token)['id']
        expect(decoded_id).to eq user.id
      end
    end

    context 'corrupted data' do
      it 'correctly sign in user and will return token' do
        post '/api/users/sign_in', params: { user: { email: 'aaaa', password: 'aaa' } }

        expected_json = {
          errors: 'invalid_email_or_password'
        }.to_json

        expect(response.body).to eq expected_json
        expect(response.code).to eq '422'
      end
    end
  end
end
