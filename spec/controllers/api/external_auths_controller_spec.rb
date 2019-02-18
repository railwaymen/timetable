# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::ExternalAuthsController do
  render_views

  module ExternalAuthStrategy
    class Sample < Base
      def initialize(*args); end
    end
  end

  let(:admin) { create(:admin) }

  describe 'GET new' do
    it 'authenticates user' do
      get :new, format: :json
      expect(response.code).to eql('401')
    end

    it 'returns auth path' do
      sign_in(admin)
      strategy_double = double('strategy', request_data: { token: 'token', secret: 'secret' }, authorization_url: 'http://www.example.com')
      allow(ExternalAuthStrategy::Sample).to receive(:new).with(anything) { strategy_double }
      params = { provider: 'sample', domain: 'http://www.example.com' }
      get :new, format: :json, params: params
      expect(response).to be_ok
      expect(strategy_double).to have_received(:request_data)
      expect(strategy_double).to have_received(:authorization_url)
    end
  end

  describe 'POST create' do
    let(:project) { create(:project) }
    it 'creates auth' do
      project
      sign_in(admin)
      strategy_double = double('strategy', request_data: { token: 'token', secret: 'secret' },
                                           authorization_url: 'http://www.example.com', prepare_request_data: nil, init_access_token: nil, data: { token: '1', secret: '2' })
      allow(ExternalAuthStrategy::Sample).to receive(:new).with(anything) { strategy_double }
      request_data = { 'a' => 1, 'b' => 2 }
      params = { external_auth: { provider: 'sample', project_id: project.id, request_data: JwtService.encode(payload: request_data) } }
      expect do
        post :create, format: :json, params: params
      end.to change(ExternalAuth, :count).by(1)
      expect(response).to be_created
      expect(strategy_double).to have_received(:prepare_request_data).with(request_data)
      expect(strategy_double).to have_received(:init_access_token)
      expect(strategy_double).to have_received(:data)
    end
  end

  describe 'DELETE destroy' do
    let(:auth) { create(:external_auth) }
    it 'destroys external auth' do
      auth
      sign_in(admin)
      expect do
        delete :destroy, format: :json, params: { id: auth.id }
      end.to change(ExternalAuth, :count).by(-1)
      expect(response).to be_no_content
    end
  end
end
