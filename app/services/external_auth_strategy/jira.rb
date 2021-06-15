# frozen_string_literal: true

require 'jira-ruby'
require 'uri'

JIRA::HTTPError.class_eval do
  def initialize(response)
    @response = response
    response_body = JSON.parse(response.try(:body))
    @message = {
      message: response.try(:message),
      body: response_body.try(:[], 'message') || response_body.try(:[], 'errorMessage'),
      code: response.code,
      class: response.class.to_s,
      all: response_body
    }.to_json
    Sentry.capture_exception(StandardError.new(@message))
  end
end

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
      return destroy(params) if params['time_spent'].zero?

      task_id = params['task_id'].upcase
      account_id = client.User.myself.accountId
      task = client.Issue.find(task_id)
      work_log_data = { comment: COMMENT, timeSpentSeconds: params['time_spent'] }
      log = task.worklogs.find { |w| w.author.accountId == account_id } || task.worklogs.build
      log.save!(work_log_data, log_url(log))
    end

    def destroy(params)
      task = client.Issue.find(params['task_id'].upcase)
      log = task.worklogs.first
      return unless log

      client.delete(log.patched_url)
    end

    def versions(project_id)
      client.Project.find(project_id).versions
    end

    def version_issues(project_id, version_id)
      client.Issue.jql("project = '#{project_id}' AND fixVersion = #{version_id}")
    end

    def integration_payload(task)
      id = URI.parse(task).path.split('/').last.upcase
      issue = client.Issue.find(id)
      {
        task_id: issue.key,
        summary: issue.summary,
        labels: issue.fields['labels'],
        issue_type: issue.fields['issuetype']['name']
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
        'domain' => domain,
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

    def log_url(log)
      return log.patched_url if log.issue.timetracking['originalEstimateSeconds'].present?

      uri = URI.parse(log.patched_url)
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
