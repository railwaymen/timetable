# frozen_string_literal: true

require 'active_support/concern'

module ExternalValidatable
  extend ActiveSupport::Concern

  included do
    validate :validate_url, :validate_integration
  end

  private

  def validate_integration
    return nil if errors.key?(:task) || project.nil? || !project.external_integration_enabled? || user.external_auth.nil? || task.blank?

    return validate_task_in_project unless external_payload.nil?

    errors.add(:task, :invalid_external)
  end

  def validate_url
    return if task.blank?

    URI.parse(task)
  rescue URI::InvalidURIError
    errors.add(:task, :invalid_uri)
  end

  def validate_task_in_project
    errors.add(:task, :invalid_external_project) if response_payload && !task_in_project?
  end

  def external_payload
    return @external_payload if defined?(@external_payload)
    return @external_payload = nil if project.nil? || !project.external_integration_enabled? || user.external_auth.nil? || task.blank?

    integration_payload = ExternalAuthStrategy.const_get(external_provider_name).from_data(user.external_auth.data).integration_payload(task)
    @external_payload = if integration_payload.nil? # cache result to prevent multiple api calls
                          nil
                        else
                          { user.external_auth.provider => integration_payload }
                        end
  end

  def external_provider_name
    @external_provider_name ||= user.external_auth.provider
  end

  def task_in_project?
    response_payload[:task_id]&.to_s&.include?(project[:external_payload]['id'].to_s)
  end

  def response_payload
    @response_payload ||= external_payload[external_provider_name]
  end
end
