# frozen_string_literal: true

require 'rails_helper'

describe RecountAccountingPeriodsWorker do
  describe '#perform' do
    it 'calls RecountAccountingPeriods' do
      user = create(:user)
      work_time = create(:work_time, user: user)
      period = create(:accounting_period, user: user)
      user_id = user.id
      expect(RecountAccountingPeriods).to receive(:call).with(user: user, work_times: [work_time], periods: [period])
      RecountAccountingPeriodsWorker.new.perform user_id: user_id
    end
  end
end
