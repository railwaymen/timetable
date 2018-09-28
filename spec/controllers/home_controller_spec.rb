# frozen_string_literal: true

require 'rails_helper'

RSpec.describe HomeController do
  render_views

  describe '#index' do
    it 'authenticates user' do
      get :index
      expect(response.code).to eql('302')
    end

    it 'renders home page' do
      sign_in(create(:user))
      get :index
      expect(response.code).to eql('200')
    end
  end
end
