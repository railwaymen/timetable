class RecountAccountingPeriodsWorker
  include Sidekiq::Worker
  include Sidekiq::Status::Worker

  def perform(options)
    options.symbolize_keys!
    user = User.find(options[:user_id])
    work_times = WorkTime.where(user: user, active: true).order(:starts_at)
    periods = AccountingPeriod.where(user: user).order(:starts_at)
    RecountAccountingPeriods.call(user: user, work_times: work_times,
                                  periods: periods)
  end
end
