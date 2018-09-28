require 'rails_helper'

describe DecreaseWorkTime do
  let(:user) { create(:user) }
  def decrease_work_time(duration, date)
    DecreaseWorkTime.call(duration: duration, date: date, user: user)
  end

  it 'does nothing when there is no matching period' do
    expect { decrease_work_time(2.hours, Date.new(2015, 9, 1).in_time_zone) }.not_to raise_error
  end

  context 'full-time' do
    it 'decreases time from matching period' do
      params = { full_time: true, starts_at: Time.new(2015, 9, 1).in_time_zone, ends_at: Time.new(2015, 9, 30).in_time_zone, counted_duration: 168.hours, duration: 168.hours, user: user, position: 1 }
      period = create :accounting_period, params

      decrease_work_time(2.hours, Date.new(2015, 9, 1))

      expect(period.reload.counted_duration).to eql(166.hours.to_i)
    end
  end

  context 'contractor' do
    it 'decreases time from matching period' do
      params = { counted_duration: 20.hours, duration: 20.hours, user: user, position: 1, closed: true }
      period = create :accounting_period, params

      decrease_work_time(2.hours, Date.new(2015, 9, 1).in_time_zone)

      expect(period.reload.counted_duration).to eql(18.hours.to_i)
    end

    it 'splits time accross next periods' do
      period1 = create :accounting_period, counted_duration: 10.hours, duration: 10.hours, user: user, position: 1, closed: true
      period2 = create :accounting_period, counted_duration: 6.hours, duration: 6.hours, user: user, position: 2, closed: true

      decrease_work_time(8.hours, Date.new(2015, 9, 1).in_time_zone)

      expect(period1.reload.counted_duration).to eql(8.hours.to_i)
      expect(period1.closed).to eql(false)
      expect(period2.reload.counted_duration).to eql(0)
      expect(period2.closed).to eql(false)
    end
  end
end
