# frozen_string_literal: true

class IncreaseWorkTime
  include Interactor
  delegate :user, :duration, :starts_at, :ends_at, :date, to: :context

  def call
    add_duration
  end

  def add_duration
    add_duration_to_full_time_period || add_duration_to_contract_periods
  end

  def add_duration_to_full_time_period
    full_time_period = user.accounting_periods.full_time.where('starts_at <= ? AND ends_at >= ?', Time.zone.parse(date.to_s), Time.zone.parse(date.to_s)).first
    full_time_period&.update(counted_duration: full_time_period.counted_duration + duration)
  end

  # rubocop:disable Metrics/MethodLength
  def add_duration_to_contract_periods
    remaining_duration = duration
    while remaining_duration.positive?
      period = user.accounting_periods.contract.where(closed: false).order('position').first
      break if period.nil?

      period.starts_at ||= starts_at

      if period.counted_duration + remaining_duration > period.duration
        remaining_duration -= period.duration - period.counted_duration
        period_ends_at = starts_at + duration - remaining_duration
        period.update!(counted_duration: period.duration, closed: true, ends_at: period_ends_at)
      elsif period.counted_duration + remaining_duration == period.duration
        remaining_duration -= period.duration - period.counted_duration
        period.update!(counted_duration: period.duration, closed: true, ends_at: ends_at)
      else
        period.update!(counted_duration: period.counted_duration + remaining_duration)
        remaining_duration = 0
      end
    end
  end
  # rubocop:enable Metrics/MethodLength
end
