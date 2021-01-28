# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::CompaniesController do
  describe '#index' do
    it 'returns all companies' do
      user = create(:user)
      create_list(:company, 2)
      sign_in user
      get :index, params: { format: 'json' }
      
      expect(JSON.parse(response.body).count).to eql(2)
    end
  end
end