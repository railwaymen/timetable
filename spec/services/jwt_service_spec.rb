# frozen_string_literal: true

require 'rails_helper'

RSpec.describe JwtService do
  describe 'encode' do
    it 'properly encode user data' do
      user = FactoryBot.create :user

      token = described_class.encode payload: user.as_json

      expect(described_class.decode(token: token)['id']).to eq user.id
    end
  end
end
