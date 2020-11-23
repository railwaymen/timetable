# frozen_string_literal: true

require 'rails_helper'

RSpec.describe MilestonesQuery do
  describe '#perform' do
    it 'returns works times assigned to milestone by dates' do
      user = create(:user)
      project = create(:project)
      create(:milestone, project: project, starts_on: 5.days.ago, ends_on: 10.days.from_now)

      create(:work_time, project: project, starts_at: 10.days.ago.beginning_of_day, ends_at: 10.days.ago.beginning_of_day + 2.hours, user: user)
      work_time1 = create(:work_time, project: project, user: user)
      work_time2 = create(:work_time, :with_jira_url, project: project, user: user)

      results = described_class.new(project: project, params: { with_estimates: true }).results
      expect(results.first.work_times_duration).to eq([work_time1, work_time2].sum(&:duration))
    end

    it 'returns works times assigned to milestone by task id' do
      user = create(:user)
      project = create(:project)

      create(:work_time, :with_jira_url, project: project, user: user)
      work_time2 = create(:work_time, :with_jira_url, project: project, user: user)
      create(:milestone, project: project, starts_on: 5.days.from_now, ends_on: 10.days.from_now, jira_issues: [work_time2.jira_task_id])

      results = described_class.new(project: project, params: { with_estimates: true }).results
      expect(results.first.work_times_duration).to eq(work_time2.duration)
    end

    it 'returns works times assigned to milestone by task id or by date' do
      user = create(:user)
      project = create(:project)

      create(:work_time, project: project, starts_at: 10.days.ago.beginning_of_day, ends_at: 10.days.ago.beginning_of_day + 2.hours, user: user)
      work_time1 = create(:work_time, project: project, user: user)
      work_time2 = create(:work_time, :with_jira_url, project: project, user: user)
      create(:milestone, project: project, starts_on: 5.days.ago, ends_on: 10.days.from_now, jira_issues: [work_time2.jira_task_id])

      results = described_class.new(project: project, params: { with_estimates: true }).results
      expect(results.first.work_times_duration).to eq([work_time1, work_time2].sum(&:duration))
    end

    it 'rejects works times which are assigned to other milestone by jira ticket' do
      user = create(:user)
      project = create(:project)

      work_time1 = create(:work_time, :with_jira_url, project: project, user: user)
      work_time2 = create(:work_time, :with_jira_url, project: project, user: user)

      create(:milestone, project: project, starts_on: 5.days.ago, ends_on: 10.days.from_now, jira_issues: [work_time1.jira_task_id])
      create(:milestone, project: project, starts_on: 5.days.from_now, ends_on: 15.days.from_now, jira_issues: [work_time2.jira_task_id])

      results = described_class.new(project: project, params: { with_estimates: true }).results
      expect(results.first.work_times_duration).to eq(work_time1.duration)
    end
  end
end
