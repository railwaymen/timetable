# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ApplicationController, type: :controller do
  describe 'current user' do
    context 'as token' do
      it 'correctly select current user' do
        user = FactoryGirl.create :user
        request.headers['token'] = JwtService.encode payload: user.as_json

        expect(controller.send(:current_user).id).to eq user.id
      end
    end

    context 'as session' do
      it 'correctly select current user' do
        user = FactoryGirl.create :user
        session['warden.user.user.key'] = [[user.id], 'blah']

        expect(controller.send(:current_user).id).to eq user.id
      end
    end
  end
end
