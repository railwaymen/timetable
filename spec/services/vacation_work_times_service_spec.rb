# frozen_string_literal: true

require 'rails_helper'

RSpec.describe VacationWorkTimesService do
  let(:staff_manager) { create(:staff_manager) }
  let(:user) { create(:user) }

  describe '#save' do
    it 'returns nil when user is not admin' do
      vacation = create(:vacation)
      expect(described_class.new(vacation, user).save).to eql(nil)
    end

    it 'returns nil when there are work times in vacation range' do
      vacation = create(:vacation)
      create(:work_time, user: vacation.user, starts_at: vacation.start_date + 8.hours, ends_at: vacation.start_date + 12.hours)
      expect(described_class.new(vacation, staff_manager).save).to eql(nil)
    end

    it 'creates work times for given vacation' do
      vacation = create(:vacation, start_date: Time.current.beginning_of_day, end_date: Time.current.beginning_of_day + 7.days)
      create(:project, name: 'Vacation')
      work_times_count = vacation.start_date.business_days_until(vacation.end_date + 1.day)
      expect { described_class.new(vacation, staff_manager).save }.to change { WorkTime.count }.by(work_times_count)
      expect(WorkTime.pluck(:starts_at).map(&:to_date)).to eql(vacation.start_date.business_dates_until(vacation.end_date + 1.day))
      expect(WorkTime.distinct.pluck(:updated_by_admin)).to eql([true])
      expect(WorkTime.distinct.pluck(:vacation_id)).to eql([vacation.id])
      expect(WorkTime.distinct.pluck(:creator_id)).to eql([staff_manager.id])
      expect(WorkTime.distinct.pluck(:body)).to eql([I18n.t("common.vacation_code.#{vacation.vacation_type}")])
    end
  end
end
