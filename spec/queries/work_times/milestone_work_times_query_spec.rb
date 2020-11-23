# frozen_string_literal: true

require 'rails_helper'

RSpec.describe WorkTimes::MilestoneWorkTimesQuery do
  describe '#perform' do
    it 'returns works times assigned to milestone by dates' do
      user = create(:user)
      milestone = create(:milestone, starts_on: 5.days.ago, ends_on: 10.days.from_now)

      create(:work_time, project: milestone.project, starts_at: 10.days.ago.beginning_of_day, ends_at: 10.days.ago.beginning_of_day + 2.hours, user: user)
      work_time1 = create(:work_time, project: milestone.project, user: user)
      work_time2 = create(:work_time, :with_jira_url, project: milestone.project, user: user)

      results = described_class.new(milestone, milestone.project, milestone.starts_on, milestone.ends_on).perform
      expect(results).to eq([work_time1, work_time2])
    end

    it 'returns works times assigned to milestone by task id' do
      user = create(:user)
      project = create(:project)

      create(:work_time, :with_jira_url, project: project, user: user)
      work_time2 = create(:work_time, :with_jira_url, project: project, user: user)
      milestone = create(:milestone, project: project, starts_on: 5.days.from_now, ends_on: 10.days.from_now, jira_issues: [work_time2.jira_task_id])

      results = described_class.new(milestone, milestone.project, milestone.starts_on, milestone.ends_on).perform
      expect(results).to eq([work_time2])
    end

    it 'returns works times assigned to milestone by task id or by date' do
      user = create(:user)
      project = create(:project)

      create(:work_time, project: project, starts_at: 10.days.ago.beginning_of_day, ends_at: 10.days.ago.beginning_of_day + 2.hours, user: user)
      work_time1 = create(:work_time, project: project, user: user)
      work_time2 = create(:work_time, :with_jira_url, project: project, user: user)
      milestone = create(:milestone, project: project, starts_on: 5.days.ago, ends_on: 10.days.from_now, jira_issues: [work_time2.jira_task_id])

      results = described_class.new(milestone, milestone.project, milestone.starts_on, milestone.ends_on).perform
      expect(results).to eq([work_time1, work_time2])
    end

    it 'rejects works times which are assigned to other milestone by jira ticket' do
      user = create(:user)
      project = create(:project)

      work_time1 = create(:work_time, :with_jira_url, project: project, user: user)
      work_time2 = create(:work_time, :with_jira_url, project: project, user: user)

      milestone = create(:milestone, project: project, starts_on: 5.days.ago, ends_on: 10.days.from_now, jira_issues: [work_time1.jira_task_id])
      create(:milestone, project: project, starts_on: 5.days.from_now, ends_on: 15.days.from_now, jira_issues: [work_time2.jira_task_id])

      results = described_class.new(milestone, milestone.project, milestone.starts_on, milestone.ends_on).perform
      expect(results).to eq([work_time1])
    end
  end
end
