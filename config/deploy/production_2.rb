# frozen_string_literal: true

set :rails_env, :production
set :deploy_to, ENV['CAP_DEPLOY_TO_2']
server ENV['CAP_SERVER_2'], user: ENV['CAP_SSH_USER_2'], roles: %w[app db web]
set :rvm_ruby_version, 'ruby-2.7.0@leaderboard'
set :sidekiq_systemd_name, 'tt_sidekiq'
