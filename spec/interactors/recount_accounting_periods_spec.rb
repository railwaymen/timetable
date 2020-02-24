# frozen_string_literal: true

require 'rails_helper'

describe RecountAccountingPeriods do
  let(:user) { create :user }
  before do
    2.times { create :accounting_period, user: user, duration: 10.hours }
    6.times do |i|
      hour = format('%<hour>02d', hour: i * 2)
      starts_at = Time.zone.parse("2016-03-12 #{hour}:00:00")
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
