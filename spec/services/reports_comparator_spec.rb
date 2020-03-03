# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportsComparator do
  describe '#call' do
    context 'when work_times overlap report duration' do
      it 'returns true for not updated work times' do
        user = create(:user)
        project = create(:project)
        work_time1 = create(:work_time, user: user, project: project, active: true, starts_at: Time.current - 25.minutes, ends_at: Time.current - 20.minutes)
        work_time2 = create(:work_time, user: user, project: project, active: true, starts_at: Time.current - 45.minutes, ends_at: Time.current - 30.minutes)
        duration_sum = work_time1.duration + work_time2.duration
        report = create(:project_report, project: project, duration_sum: duration_sum, starts_at: 1.day.ago, ends_at: Time.current)

        result = described_class.new.call(report, project)

        expect(result).to be true
      end

      it 'return false for updated work times' do
        user = create(:user)
        project = create(:project)
        work_time1 = create(:work_time, user: user, project: project, active: true, starts_at: Time.current - 25.minutes, ends_at: Time.current - 20.minutes)
        work_time2 = create(:work_time, user: user, project: project, active: true, starts_at: Time.current - 45.minutes, ends_at: Time.current - 30.minutes)
        duration_sum = work_time1.duration + work_time2.duration
        report = create(:project_report, project: project, duration_sum: duration_sum, starts_at: 1.day.ago, ends_at: Time.current)
        create(:work_time, user: user, project: project, active: true, starts_at: Time.current - 5.minutes, ends_at: Time.current - 2.minutes)

        result = described_class.new.call(report, project)

        expect(result).to be false
      end
    end

    context 'when work times do not overlap report duration' do
      it 'returns true for updated work times' do
        user = create(:user)
        project = create(:project)
        work_time = create(:work_time, user: user, project: project, active: true, starts_at: Time.current - 45.minutes, ends_at: Time.current - 30.minutes)
        report = create(:project_report, project: project, duration_sum: work_time.duration, starts_at: 1.day.ago, ends_at: Time.current)
        create(:work_time, user: user, project: project, active: true, starts_at: Time.current - 26.hours, ends_at: Time.current - 25.hours)

        result = described_class.new.call(report, project)

        expect(result).to be true
      end
    end
  end
end
