# frozen_string_literal: true

# :nocov:
require 'jira-ruby'

module ExternalAuthStrategy
  class Jira < Base
    CONSUMER_KEY = 'timetable'.freeze

    attr_reader :domain, :client

    def self.from_external_auth(external_auth)
      new(domain: external_auth.data[:domain]).tap do |result|
        result.set_access_token(external_auth.data['token'], external_auth.data['secret'])
      end
    end

    def initialize(params)
      @domain = params[:domain]
      @client = new_client
    end

    delegate :set_access_token, to: :client

    def init_access_token(oauth_verifier)
      client.init_access_token(oauth_verifier: oauth_verifier)
    end

    def prepare_request_data(params)
      client.set_request_token(params['token'], params['secret'])
    end

    def authorization_url
      client.request_token.authorize_url
    end

    def token
      client.access_token.token
    end

    def secret
      client.access_token.secret
    end

    def data
      {
        domain: domain,
        token: token,
        secret: secret
      }
    end

    def request_data
      {
        token: client.request_token.token,
        secret: client.request_token.secret
      }
    end

    private

    def new_client
      ::JIRA::Client.new(
        consumer_key: CONSUMER_KEY,
        site: domain,
        context_path: '',
        private_key_file: Rails.application.secrets.private_key_location
      )
    end
  end
end
# :nocov:
