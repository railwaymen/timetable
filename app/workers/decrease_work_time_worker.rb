# frozen_string_literal: true

class DecreaseWorkTimeWorker
  include Sidekiq::Worker

  def perform(options)
    options.symbolize_keys!
    user = User.find(options[:user_id])
    duration = options[:duration]
    date = Date.parse(options[:date])
    DecreaseWorkTime.call(duration: duration, date: date, user: user)
  end
end
