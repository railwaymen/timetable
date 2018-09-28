require 'rails_helper'

describe RecountAccountingPeriods do
  let(:user) { create :user }
  before do
    2.times { create :accounting_period, user: user, duration: 10.hours }
    6.times do |i|
      starts_at = Time.new(2016, 3, 12, i * 2).in_time_zone
      create :work_time, user: user, starts_at: starts_at,
                         ends_at: starts_at + 2.hours
    end
    RecountAccountingPeriods.call user: user, work_times: user.work_times,
                                  periods: user.accounting_periods
  end

  it 'assigns correct counted_duration to periods' do
    periods_counted = user.accounting_periods.sum(:counted_duration)
    expect(periods_counted).to eq user.work_times.sum(:duration)
  end
end
