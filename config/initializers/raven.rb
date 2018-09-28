if Rails.application.secrets.raven_url.present?
  Raven.configure do |config|
    config.dsn = Rails.application.secrets.raven_url
  end
end
