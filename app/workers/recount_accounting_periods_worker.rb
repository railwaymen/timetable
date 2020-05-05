# frozen_string_literal: true

class RecountAccountingPeriodsWorker
  include Sidekiq::Worker
  include Sidekiq::Status::Worker

  def perform(options)
    options.symbolize_keys!
    user = User.find(options[:user_id])

    RecountAccountingPeriods.call(user: user)
  end
end
