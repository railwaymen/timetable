# frozen_string_literal: true

module Api
  class ExternalAuthsController < Api::BaseController
    respond_to :json

    before_action :authenticate_admin_or_manager_or_leader!

    def new
      @provider = ExternalAuthStrategy.const_get(params[:provider].camelize).new(request.query_parameters.except(:provider))
      @data = JwtService.encode(payload: @provider.request_data)
    end

    def create
      @provider = ExternalAuthStrategy.const_get(params[:external_auth][:provider].camelize).new('domain' => params[:external_auth][:domain])
      @provider.prepare_request_data(JwtService.decode(token: params[:external_auth][:request_data])) if params[:external_auth][:request_data]
      @provider.init_access_token(params[:external_auth][:token])
      @external_auth = ExternalAuth.create(project_id: params[:external_auth][:project_id], provider: params[:external_auth][:provider].camelize, data: @provider.data)
      respond_with :api, @external_auth
    end

    def destroy
      ExternalAuth.find(params[:id]).destroy!
      head :no_content
    end
  end
end
