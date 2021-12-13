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
set :linked_dirs, %w[system storage log tmp/pids tmp/cache tmp/sockets vendor/bundle public/images]

# Default value for default_env is {}
# set :default_env, { path: "/opt/ruby/bin:$PATH" }

# Default value for keep_releases is 5
# set :keep_releases, 5

namespace :sidekiq do
  task :stop do
    on roles(:app) do
      execute :systemctl, '--user', :stop, fetch(:sidekiq_systemd_name)
    end
  end

  task :start do
    on roles(:app) do
      execute :systemctl, '--user', :start, fetch(:sidekiq_systemd_name)
    end
  end

  task :restart do
    on roles(:app) do
      execute :systemctl, '--user', :restart, fetch(:sidekiq_systemd_name)
    end
  end
end

namespace :deploy do
  after :publishing, :export_translations do
    on roles(:web), in: :groups, limit: 3, wait: 10 do
      within current_path do
        with rails_env: fetch(:rails_env) do
          execute :rake, 'i18n:js:export'
        end
      end
    end
  end

  after :publishing, :restart do
    on roles(:web), in: :groups, limit: 3, wait: 10 do
      execute :touch, release_path.join('tmp/restart.txt')
    end
  end

  after :publishing, :restart do
    on roles :web do
      execute :systemctl, '--user', :restart, fetch(:sidekiq_systemd_name)
    end
  end

  after :updated, 'sidekiq:stop'
  after :published, 'sidekiq:start'
  after :failed, 'sidekiq:restart'
end
