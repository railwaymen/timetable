# frozen_string_literal: true

set :output, "#{path}/log/whenever.log"
env :PATH, ENV['PATH']
set :job_template, '/bin/bash -c ":job"'

every :day, at: '4 am' do
  rake 'tasks:enqueue_miletones_import'
end

every '0 7 * * 1-5' do
  rake 'tasks:notify_off_employees'
end
