# frozen_string_literal: true

namespace :tasks do
  desc 'Checks & notifies about off employees'
  task notify_off_employees: :environment do
    NotifyOffEmployees.call
  end
end
