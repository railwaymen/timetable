# frozen_string_literal: true

require 'rails_helper'

describe AccountingPeriodsGenerator do
  let(:user) { create :user }
  before do
    @generator = AccountingPeriodsGenerator.new user_id: user.id,
                                                periods_count: 3,
                                                start_on: Date.civil(2016, 1, 5)
  end

  it "doesn't generate periods if one overlaps" do
    create :accounting_period, user_id: user.id, full_time: true,
                               starts_at: Date.civil(2016, 1, 15),
                               ends_at: Date.civil(2016, 1, 31)
    expect { @generator.generate }.to raise_error(ActiveRecord::RecordInvalid)
  end

  it "generates 'periods_count' periods" do
    @generator.generate
    expect(AccountingPeriod.count).to eq 3
  end

  it 'generates periods with correct next position' do
    @generator.generate
    expect(AccountingPeriod.first.position).to eq 1
    expect(AccountingPeriod.second.position).to eq 2
    expect(AccountingPeriod.third.position).to eq 3
  end

  it 'generates periods with correct start date' do
    @generator.generate
    expect(AccountingPeriod.first.starts_at.to_date).to eq Date.civil(2016, 1, 1)
  end

  it 'generates periods with assumed end date' do
    @generator.generate
    expect(AccountingPeriod.last.ends_at.to_date).to eq Date.civil(2016, 3, 31)
  end

  context 'periods duration' do
    it 'is counted correctly, without weekends' do
      @generator.generate
      expect(AccountingPeriod.first.duration).to eq 152.hours.to_i
    end

    it 'excludes holidays on weekends' do
      AccountingPeriodsGenerator.new(user_id: user.id, periods_count: 1,
                                     start_on: Date.civil(2016, 3, 1)).generate
      # Sunday, 27 Mar 2016, "Niedziela Wielkanocna"
      expect(AccountingPeriod.first.duration).to eq 176.hours.to_i
    end
  end
end
