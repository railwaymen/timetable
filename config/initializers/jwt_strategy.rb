# frozen_string_literal: true

require 'devise/strategies/authenticatable'

module Devise
  module Strategies
    class JwtStrategy < Base
      def valid?
        token.present?
      end

      def authenticate!
        payload = JwtService.decode token: token
        success! User.find payload['id']
      end

      def token
        request.headers['token']
      end
    end
  end
end
