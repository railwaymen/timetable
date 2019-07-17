# frozen_string_literal: true

require 'active_support/concern'

module ExternalValidatable
  extend ActiveSupport::Concern

  included do
    validate :validate_integration
  end

  private

  def validate_integration
    return nil if external_auth.nil? || task.blank?

    return unless external_payload.nil?

    errors.add(:task, I18n.t('activerecord.errors.models.work_time.attributes.task.invalid_external'))
  end

  def external_payload
    return @external_payload if defined?(@external_payload)
    return @external_payload = nil if external_auth.nil? || task.blank?

    integration_payload = ExternalAuthStrategy.const_get(external_auth.provider).from_data(external_auth.data).integration_payload(self)
    @external_payload = if integration_payload.nil? # cache result to prevent multiple api calls
                          nil
                        else
                          { external_auth.provider => integration_payload }
                        end
  end
end
