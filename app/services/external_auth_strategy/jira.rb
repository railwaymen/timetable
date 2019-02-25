# frozen_string_literal: true

require 'jira-ruby'
require 'uri'

module ExternalAuthStrategy
  class Jira < Base
    CONSUMER_KEY = 'timetable'
    COMMENT = 'Time registered in Timetable'

    attr_reader :domain, :client

    def self.from_data(data)
      new('domain' => data['domain']).tap do |result|
        result.set_access_token(data['token'], data['secret'])
      end
    end

    def initialize(params)
      @domain = params['domain']
      @client = new_client
    end

    delegate :set_access_token, to: :client

    def update(params)
      task_id = params['task_id'].upcase
      task = client.Issue.find(task_id)
      work_log_data = { comment: COMMENT, timeSpentSeconds: params['time_spent'] }
      log = task.worklogs.first || task.worklogs.build
      log.save!(work_log_data, url_with_estimate_query(log.url))
    end

    def integration_payload(work_time)
      id = URI.parse(work_time.task).path.split('/').last.upcase
      {
        'task_id' => client.Issue.find(id).key
      }
    rescue JIRA::HTTPError
      nil
    end

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
        'domain' =>  domain,
        'token' => token,
        'secret' => secret
      }
    end

    def request_data
      {
        'token' => client.request_token.token,
        'secret' => client.request_token.secret
      }
    end

    private

    def url_with_estimate_query(url)
      uri = URI.parse(url)
      uri.path = "/#{uri.path}" unless uri.path.starts_with?('/')
      uri.query = URI.encode_www_form(adjustEstimate: 'leave')
      uri.to_s
    end

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
