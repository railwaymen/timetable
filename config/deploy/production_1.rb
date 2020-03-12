# frozen_string_literal: true

set :rails_env, :production
set :deploy_to, ENV['CAP_DEPLOY_TO_1']
server ENV['CAP_SERVER_1'], user: ENV['CAP_SSH_USER_1'], roles: %w[app db web]
set :rvm_ruby_version, 'ruby-2.4.1@leaderboard'
set :sidekiq_systemd_name, 'tt_sidekiq'
