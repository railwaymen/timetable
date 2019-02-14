# frozen_string_literal: true

if Rails.application.secrets.raven_url.present?
  Raven.configure do |config|
    config.dsn = Rails.application.secrets.raven_url
    config.environments = %w[production staging]
  end
end
