# frozen_string_literal: true

set :nvm_type, :system
set :nvm_node, 'v13.9.0'
set :rails_env, :staging
set :deploy_to, ENV['CAP_STAGING_DEPLOY_TO']
server ENV['CAP_STAGING_SERVER'], user: ENV['CAP_STAGING_SSH_USER'], roles: %w[app db web]
set :rvm_ruby_version, 'ruby-2.7.0@leaderboard'
set :branch, :develop
set :sidekiq_systemd_name, 'tt_sidekiq'
