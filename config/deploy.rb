# frozen_string_literal: true

# config valid only for current version of Capistrano
lock '3.11.0'

set :application, 'timetable'
set :bundle_bins, fetch(:bundle_bins, []).concat(%w[sidekiq sidekiqctl])
set :rvm_map_bins, fetch(:rvm_map_bins, []).concat(%w[sidekiq sidekiqctl])
set :repo_url, 'https://github.com/railwaymen/timetable.git'

# Default branch is :master
# ask :branch, `git rev-parse --abbrev-ref HEAD`.chomp

# Default deploy_to directory is /var/www/my_app_name
# set :deploy_to, '/var/www/my_app_name'

# Default value for :scm is :git
# set :scm, :git

# Default value for :format is :pretty
# set :format, :pretty

# Default value for :log_level is :debug
# set :log_level, :debug

# Default value for :pty is false
# set :pty, true

set :linked_files, %w[.env config/sidekiq.yml]
set :linked_dirs, %w[log tmp/pids tmp/cache tmp/sockets vendor/bundle public/images]

# Default value for default_env is {}
# set :default_env, { path: "/opt/ruby/bin:$PATH" }

# Default value for keep_releases is 5
# set :keep_releases, 5

namespace :deploy do
  after :publishing, :restart do
    on roles(:web), in: :groups, limit: 3, wait: 10 do
      execute :touch, release_path.join('tmp/restart.txt')
    end
  end
end
