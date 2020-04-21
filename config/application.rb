require_relative 'boot'

require 'rails/all'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)
# 5.1
# Bundler.require(*Rails.groups)

module TimeTable
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    # config.load_defaults 5.1

    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration should go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded.

    config.autoload_paths += %W[#{config.root}/lib]
    config.eager_load_paths += %W[#{config.root}/lib]

    config.action_dispatch.rescue_responses['Pundit::NotAuthorizedError'] = :forbidden

    config.action_mailer.default_url_options = { host: Rails.application.secrets.mailer[:host] }
    config.action_mailer.delivery_method = :sendmail
    config.action_mailer.default_options = { from: Rails.application.secrets.mailer[:from] }
    config.action_mailer.preview_path = "#{Rails.root}/lib/mailer_previews"

    # Set Time.zone default to the specified zone and make Active Record auto-convert to this zone.
    # Run "rake -D time" for a list of tasks for finding time zone names. Default is UTC.
    config.time_zone = 'Warsaw'
    config.react.addons = true
    config.webpacker.check_yarn_integrity = false

    config.assets.precompile += %w( i18n.js )

    # The default locale is :en and all translations from config/locales/*.rb,yml are auto loaded.
    # config.i18n.load_path += Dir[Rails.root.join('my', 'locales', '*.{rb,yml}').to_s]
    config.i18n.default_locale = Rails.application.secrets.default_lang || 'en'
    config.i18n.available_locales = %i[en pl]
    config.to_prepare do
      DeviseController.respond_to :html, :json

      DeviseController.class_eval <<-EXT
        wrap_parameters :user, format: [:json]
      EXT
    end
  end
end
