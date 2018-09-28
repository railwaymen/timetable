require 'rails_helper'

describe IncreaseWorkTimeWorker do
  describe '#perform' do
    it 'calls IncreaseWorkTime' do
      user = create(:user)
      duration = 1000
      starts_at = '2016-05-01 08:00:00'
      ends_at = '2016-05-01 10:00:00'
      date = '2016-05-01'
      user_id = user.id
      expect(IncreaseWorkTime).to receive(:call).with(user: user, duration: duration, starts_at: Time.zone.parse(starts_at), ends_at: Time.zone.parse(ends_at), date: Date.parse(date))
      IncreaseWorkTimeWorker.new.perform duration: duration, starts_at: starts_at, ends_at: ends_at, date: date, user_id: user_id
    end
  end
end
