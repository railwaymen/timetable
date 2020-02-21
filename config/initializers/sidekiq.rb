# frozen_string_literal: true

Sidekiq.configure_server do |config|
  config.redis = { url: Rails.application.secrets.redis_url, namespace: Rails.application.secrets.redis_namespace }
  Sidekiq::Status.configure_server_middleware config, expiration: 30.minutes
end

Sidekiq.configure_client do |config|
  config.redis = { url: Rails.application.secrets.redis_url, namespace: Rails.application.secrets.redis_namespace }
  Sidekiq::Status.configure_client_middleware config, expiration: 30.minutes
end
