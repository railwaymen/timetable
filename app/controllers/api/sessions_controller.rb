# frozen_string_literal: true

module Api
  class SessionsController < Devise::SessionsController
    protect_from_forgery with: :exception, except: :create

    def create
      self.resource = warden.authenticate(scope: :user)
      if resource
        @user  = resource
        @token = JwtService.encode(payload: { id: resource.id }).as_json
      else
        render json: { errors: 'invalid_email_or_password' }, status: :unprocessable_entity
      end
    end
  end
end
