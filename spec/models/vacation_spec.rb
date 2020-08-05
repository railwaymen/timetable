# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Vacation, type: :model do
  it { should belong_to :user }
  it { should have_many :vacation_interactions }
  it { should have_many :work_times }

  it { should validate_presence_of :start_date }
  it { should validate_presence_of :end_date }
  it { should validate_presence_of :vacation_type }
  it { should validate_presence_of :status }
  it { should validate_presence_of :user_id }

  context 'if type equals others' do
    before { allow(subject).to receive(:others?).and_return(true) }
    it { should validate_presence_of :description }
  end

  context 'if type not equals others' do
    before { allow(subject).to receive(:others?).and_return(false) }
    it { should_not validate_presence_of :description }
  end

  describe Vacation, '.current_year' do
    it 'returns vacations from current year' do
      current_year_vacation = create(:vacation)
      next_year_vacation = create(:vacation, start_date: Time.current + 1.year, end_date: Time.current + 1.year + 3.days)
      expect(Vacation.current_year).to include(current_year_vacation)
      expect(Vacation.current_year).to_not include(next_year_vacation)
    end
  end

  it 'validates end_date' do
    vacation = build(:vacation, end_date: Time.current - 10.days)
    expect(vacation.valid?).to be_falsey
    expect(vacation.errors.details[:start_date]).to eql([{ error: :greater_than_end_date }])
  end

  context 'validates entries in Timesheet' do
    let(:user) { create(:user) }

    it 'returns vacation exists error' do
      accepted_vacation = create(:vacation, user: user, status: :accepted)
      create(:work_time, user: user, vacation: accepted_vacation)
      vacation = build(:vacation, user: user)
      expect(vacation.valid?).to be_falsey
      expect(vacation.errors.details[:base]).to eql([{ error: :vacation_exists }])
    end

    it 'returns work time exists error' do
      create(:work_time, user: user)
      vacation = build(:vacation, user: user)
      expect(vacation.valid?).to be_falsey
      expect(vacation.errors.details[:base]).to eql([{ error: :work_time_exists }])
    end
  end

  it '#user_full_name returns joined last_name and first_name' do
    user = create(:user, first_name: 'John', last_name: 'Smith')
    vacation = create(:vacation, user: user)
    expect(vacation.user_full_name).to eql('Smith John')
  end
end
