# frozen_string_literal: true

require 'rails_helper'

describe RecountAccountingPeriodsWorker do
  describe '#perform' do
    it 'calls RecountAccountingPeriods' do
      user = create(:user)
      expect(RecountAccountingPeriods).to receive(:call).with(user: user)
      RecountAccountingPeriodsWorker.new.perform user_id: user.id
    end
  end
end
