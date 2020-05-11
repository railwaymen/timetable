# frozen_string_literal: true

require 'rails_helper'

describe RecountAccountingPeriods do
  let(:user) { create :user }

  it 'assigns correct counted_duration to periods' do
    month_start = Time.zone.now.beginning_of_month
    period1 = create :accounting_period, user: user, position: 1, duration: 10.hours, starts_at: month_start.beginning_of_day, ends_at: (month_start + 5.days).end_of_day
    period2 = create :accounting_period, user: user, position: 2, duration: 2.hours, starts_at: (month_start + 5.days).beginning_of_day, ends_at: (month_start + 10.days).end_of_day
    period3 = create :accounting_period, user: user, position: 3, duration: 20.hours, starts_at: (month_start + 10.days).beginning_of_day, ends_at: (month_start + 15.days).end_of_day

    work_time1 = create :work_time, user: user, starts_at: month_start, ends_at: month_start + 12.hours
    work_time2 = create :work_time, user: user, starts_at: month_start + 12.hours, ends_at: month_start + 14.hours

    RecountAccountingPeriods.call user: user

    periods_counted = user.accounting_periods.sum(:counted_duration)
    expect(periods_counted).to eq user.work_times.sum(:duration)
    expect(period1.reload.closed?).to eql(true)
    expect(period1.starts_at).to eql(work_time1.starts_at)
    expect(period1.ends_at).to eql(work_time1.starts_at + 10.hours)
    expect(period2.reload.closed?).to eql(true)
    expect(period2.starts_at).to eql(work_time1.starts_at)
    expect(period2.ends_at).to eql(work_time1.ends_at)
    expect(period3.reload.closed?).to eql(false)
    expect(period3.starts_at).to eql(work_time2.starts_at)
  end
end
