# frozen_string_literal: true

module Api
  class ExternalAuthsController < Api::BaseController
    respond_to :json

    def new
      @provider = ExternalAuthStrategy.const_get(params[:provider].camelize).new(request.query_parameters.except(:provider))
      @data = JwtService.encode(payload: @provider.request_data)
    end

    def create
      @provider = ExternalAuthStrategy.const_get(params[:external_auth][:provider].camelize).new('domain' => params[:external_auth][:domain])
      if params[:external_auth][:request_data]
        @provider.prepare_request_data(JwtService.decode(token: params[:external_auth][:request_data]))
      end
      @provider.init_access_token(params[:external_auth][:token])
      @external_auth = ExternalAuth.create!(user: current_user, provider: params[:external_auth][:provider].camelize, data: @provider.data)
      respond_with :api, @external_auth
    end

    def destroy
      ExternalAuth.find(params[:id]).destroy!
      head :no_content
    end
  end
end
