# frozen_string_literal: true

Sentry.init do |config|
  config.dsn = Rails.application.secrets.sentry_url
  config.traces_sample_rate = 0

  config.async = lambda do |event, hint|
    Sentry::SendEventJob.perform_later(event, hint)
  end
  config.background_worker_threads = 1

  config.enabled_environments = %w[production staging]
  config.send_default_pii = true
  config.max_breadcrumbs = 0
end
