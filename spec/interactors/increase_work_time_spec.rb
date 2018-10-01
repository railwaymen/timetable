require 'rails_helper'

describe IncreaseWorkTime do
  let(:user) { create(:user) }
  def increase_work_time(starts_at, ends_at)
    duration = ends_at - starts_at
    IncreaseWorkTime.call duration: duration, user: user, starts_at: starts_at, ends_at: ends_at, date: starts_at.to_date
  end

  it 'does nothing when there is no matching period' do
    expect { increase_work_time(Time.zone.parse('2015-09-01 08:00:00'), Time.zone.parse('2015-09-01 10:00:00')) }.not_to raise_error
  end

  context 'full-time' do
    it 'adds time to matching period' do
      params = { full_time: true, starts_at: Time.zone.parse('2015-09-01'), ends_at: Time.zone.parse('2015-09-30'), duration: 168.hours, user: user, position: 1 }
      period = create :accounting_period, params

      increase_work_time(Time.zone.parse('2015-09-01 08:00:00'), Time.zone.parse('2015-09-01 10:00:00'))

      expect(period.reload.counted_duration).to eql(2.hours.to_i)
    end

    it 'adds overtime to matching period' do
      params = { full_time: true, starts_at: Time.zone.parse('2015-09-01'), ends_at: Time.zone.parse('2015-09-30'), counted_duration: 160.hours, duration: 168.hours, user: user, position: 1 }
      period = create :accounting_period, params

      increase_work_time(Time.zone.parse('2015-09-01 08:00:00'), Time.zone.parse('2015-09-01 18:00:00'))

      expect(period.reload.counted_duration).to eql(170.hours.to_i)
    end
  end

  context 'contractor' do
    it 'adds time to matching period' do
      params = { duration: 20.hours, user: user, position: 1 }
      period = create :accounting_period, params

      increase_work_time(Time.zone.parse('2015-09-01 08:00:00'), Time.zone.parse('2015-09-01 10:00:00'))

      expect(period.reload.counted_duration).to eql(2.hours.to_i)
    end

    it 'splits time accross next periods' do
      period1 = create :accounting_period, duration: 6.hours, user: user, position: 1
      period2 = create :accounting_period, duration: 10.hours, user: user, position: 2

      increase_work_time(Time.zone.parse('2015-09-01 08:00:00'), Time.zone.parse('2015-09-01 16:00:00'))

      expect(period1.reload.counted_duration).to eql(6.hours.to_i)
      expect(period1.closed).to eql(true)
      expect(period2.reload.counted_duration).to eql(2.hours.to_i)
      expect(period2.closed).to eql(false)
    end
  end
end
