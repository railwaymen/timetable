# frozen_string_literal: true

class RecountAccountingPeriods
  include Interactor
  delegate :user, to: :context

  def call
    work_times = WorkTime.kept.where(user: user).order(:starts_at)
    periods = AccountingPeriod.where(user: user).order(:starts_at)
    periods.update_all(counted_duration: 0, closed: false)
    periods.where(protected: false, full_time: false).update_all(starts_at: nil, ends_at: nil)
    work_times.each do |work_time|
      IncreaseWorkTime.call(user: user, duration: work_time.duration,
                            starts_at: work_time.starts_at,
                            ends_at: work_time.ends_at, date: work_time.starts_at.to_date)
    end
  end
end
