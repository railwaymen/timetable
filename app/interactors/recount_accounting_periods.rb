# frozen_string_literal: true

class RecountAccountingPeriods < IncreaseWorkTime
  delegate :user, :work_times, :periods, to: :context

  def call
    recount
  end

  # rubocop:disable SkipsModelValidations
  def recount
    periods.update_all(counted_duration: 0, closed: false)
    periods.where(protected: false, full_time: false).update_all(ends_at: nil)
    work_times.each do |work_time|
      IncreaseWorkTime.call(user: user, duration: work_time.duration,
                            starts_at: work_time.starts_at,
                            ends_at: work_time.ends_at, date: work_time.starts_at.to_date)
    end
  end
  # rubocop:enable SkipsModelValidations
end
