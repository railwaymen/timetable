set :rails_env, :staging
set :deploy_to, ENV['CAP_STAGING_DEPLOY_TO']
server ENV['CAP_STAGING_SERVER'], user: ENV['CAP_STAGING_SSH_USER'], roles: %w[app db web]
set :rvm_ruby_version, 'ruby-2.4.1@leaderboard'
set :branch, :develop
