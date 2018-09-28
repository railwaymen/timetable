require 'rails_helper'

RSpec.describe AccountingPeriod, type: :model do
  it { should belong_to :user }

  describe '#contract?' do
    it 'returns true if not full time' do
      account_period = AccountingPeriod.new(full_time: false)
      expect(account_period.contract?).to be true
    end
  end
end
