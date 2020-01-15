# frozen_string_literal: true

require 'rails_helper'

RSpec.describe VacationPeriodsGenerator do
  describe '#need_new_period' do
    it 'returns true when user have no vacation periods' do
      user = create(:user)
      expect(user.vacation_periods.count).to eql(0)
      expect(described_class.new.need_new_period(user)).to be_truthy
    end

    it 'returns true when user have vacation periods from previous years' do
      user = create(:user)
      create(:vacation_period, user: user, starts_at: Time.current.beginning_of_year - 1.year, ends_at: Time.current.end_of_year - 1.year)
      expect(user.vacation_periods.count).to eql(1)
      expect(described_class.new.need_new_period(user)).to be_truthy
    end

    it 'returns false when user have vacation period from current year' do
      user = create(:user)
      create(:vacation_period, user: user)
      expect(user.vacation_periods.count).to eql(1)
      expect(described_class.new.need_new_period(user)).to be_falsey
    end
  end

  describe '#generate' do
    it 'creates vacation period for users without vacation period from current year' do
      user1 = create(:user)
      user2 = create(:user)
      create(:vacation_period, user: user1)
      expect(user1.vacation_periods.count).to eql(1)
      expect(user2.vacation_periods.count).to eql(0)
      expect { described_class.new.generate }.to change { VacationPeriod.count }.by(1)
      expect(user1.vacation_periods.count).to eql(1)
      expect(user2.vacation_periods.count).to eql(1)
    end
  end
end
