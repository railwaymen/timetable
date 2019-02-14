# frozen_string_literal: true

require 'rails_helper'

describe DecreaseWorkTimeWorker do
  describe '#perform' do
    it 'calls DecreaseWorkTime' do
      user = create(:user)
      duration = 1000
      date = '2016-05-01'
      user_id = user.id
      expect(DecreaseWorkTime).to receive(:call).with(user: user, duration: duration, date: Date.parse(date))
      DecreaseWorkTimeWorker.new.perform duration: duration, date: date, user_id: user_id
    end
  end
end
