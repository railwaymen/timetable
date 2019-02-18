# frozen_string_literal: true

class IncreaseWorkTimeWorker
  include Sidekiq::Worker

  def perform(options)
    options.symbolize_keys!
    duration = options[:duration]
    starts_at = options[:starts_at]
    ends_at = options[:ends_at]
    date = Date.parse(options[:date])
    user = User.find(options[:user_id])
    IncreaseWorkTime.call(user: user, duration: duration, starts_at: Time.zone.parse(starts_at), ends_at: Time.zone.parse(ends_at), date: date)
  end
end
