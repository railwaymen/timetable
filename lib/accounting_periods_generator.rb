# frozen_string_literal: true

class AccountingPeriodsGenerator
  MAXIMUM_PERIODS_COUNT = 5 * 12 # 5 years

  def initialize(user_id:, periods_count:, start_on:)
    @user_id = user_id
    @periods_count = periods_count
    @start_on = start_on.beginning_of_month.in_time_zone
  end

  # rubocop:disable Metrics/MethodLength
  def generate
    position = User.find(@user_id).accounting_periods.maximum(:position) || 0
    AccountingPeriod.transaction do
      [@periods_count, MAXIMUM_PERIODS_COUNT].min.times do |n|
        ends_at = @start_on.end_of_month
        duration = @start_on.business_time_until(ends_at + 8.hours)
        AccountingPeriod.create! user_id: @user_id, starts_at: @start_on,
                                 ends_at: ends_at, full_time: true,
                                 duration: duration, position: position + n + 1
        @start_on = @start_on.next_month
      end
    end
  end
  # rubocop:enable Metrics/MethodLength
end
