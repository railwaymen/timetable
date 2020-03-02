# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportsComparator do
  describe '#call' do
    it 'returns true if project duration time is eqaul to project report duration' do
      user = create(:user)
      project = create(:project)
      report = create(:project_report, project: project, duration_sum: 1200, starts_at: 1.day.ago, ends_at: Time.current)
      work_time1 = create(:work_time, user: user, project: project, duration: 300, active: true, starts_at: Time.current - 25.minutes, ends_at: Time.current - 20.minutes)
      work_time2 = create(:work_time, user: user, project: project, duration: 900, active: true, starts_at: Time.current - 45.minutes, ends_at: Time.current - 30.minutes)

      result = described_class.new.call(report, project)

      expect(result).to be true
      expect(work_time1.duration + work_time2.duration).to eq report.duration_sum
    end
  end
end
