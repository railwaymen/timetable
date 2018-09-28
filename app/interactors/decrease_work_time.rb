class DecreaseWorkTime
  include Interactor
  delegate :user, :duration, :date, to: :context

  def call
    substract_duration
  end

  def substract_duration
    substract_duration_from_full_time_period || substract_duration_from_contract_periods
  end

  def substract_duration_from_full_time_period
    full_time_period = user.accounting_periods.full_time.where('starts_at <= ? AND ends_at >= ?', date, date).first
    full_time_period.update_attributes(counted_duration: full_time_period.counted_duration - duration) if full_time_period
  end

  # rubocop:disable MethodLength
  def substract_duration_from_contract_periods
    remaning_duration = duration
    while remaning_duration > 0
      period = user.accounting_periods.contract.where('counted_duration > 0').order('position DESC').first
      break if period.nil?
      if period.counted_duration - remaning_duration <= 0
        remaning_duration -= period.counted_duration
        period.update!(counted_duration: 0, ends_at: nil, closed: false)
      else
        period.update_attributes(counted_duration: period.counted_duration - remaning_duration)
        period.update!(ends_at: nil, closed: false)
        remaning_duration = 0
      end
    end
  end
end
