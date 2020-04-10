# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ReportsComparator do
  describe '#call' do
    context 'when work_times overlap report duration' do
      it 'returns true for not updated work times' do
        user = create(:user)
        project = create(:project)
        work_time1 = create(:work_time, user: user, project: project, starts_at: Time.current - 25.minutes, ends_at: Time.current - 20.minutes)
        work_time2 = create(:work_time, user: user, project: project, starts_at: Time.current - 45.minutes, ends_at: Time.current - 30.minutes)
        duration_sum = work_time1.duration + work_time2.duration
        report = create(:project_report, project: project, duration_sum: duration_sum, starts_at: 1.day.ago, ends_at: Time.current)
        project_report_creator = instance_double(ProjectReportCreator)
        allow(ProjectReportCreator).to receive(:new).and_return(project_report_creator)
        allow(project_report_creator).to receive(:team_size).with(report).and_return(report.project_report_roles.count)
        allow(project_report_creator).to receive(:duration).with(report).and_return(duration_sum)
        allow(project_report_creator).to receive(:cost).with(report).and_return(report.cost)

        result = described_class.new.call(report)

        expect(result).to be true
        expect(ProjectReportCreator).to have_received(:new)
        expect(project_report_creator).to have_received(:team_size)
        expect(project_report_creator).to have_received(:duration)
        expect(project_report_creator).to have_received(:cost)
      end

      it 'return false for updated work times' do
        user = create(:user)
        project = create(:project)
        work_time1 = create(:work_time, user: user, project: project, starts_at: Time.current - 25.minutes, ends_at: Time.current - 20.minutes)
        work_time2 = create(:work_time, user: user, project: project, starts_at: Time.current - 45.minutes, ends_at: Time.current - 30.minutes)
        duration_sum = work_time1.duration + work_time2.duration
        report = create(:project_report, project: project, duration_sum: duration_sum, starts_at: 1.day.ago, ends_at: Time.current)
        work_time3 = create(:work_time, user: user, project: project, starts_at: Time.current - 5.minutes, ends_at: Time.current - 2.minutes)
        unsynchronized_duration = duration_sum + work_time3.duration
        project_report_creator = instance_double(ProjectReportCreator)
        allow(ProjectReportCreator).to receive(:new).and_return(project_report_creator)
        allow(project_report_creator).to receive(:team_size).with(report).and_return(report.project_report_roles.count)
        allow(project_report_creator).to receive(:duration).with(report).and_return(unsynchronized_duration)
        result = described_class.new.call(report)

        expect(result).to be false
        expect(ProjectReportCreator).to have_received(:new)
        expect(project_report_creator).to have_received(:team_size)
        expect(project_report_creator).to have_received(:duration)
      end
    end

    context 'when work times do not overlap report duration' do
      it 'returns true for updated work times' do
        user = create(:user)
        project = create(:project)
        work_time = create(:work_time, user: user, project: project, starts_at: Time.current - 45.minutes, ends_at: Time.current - 30.minutes)
        report = create(:project_report, project: project, duration_sum: work_time.duration, starts_at: 1.day.ago, ends_at: Time.current)
        create(:work_time, user: user, project: project, starts_at: Time.current - 26.hours, ends_at: Time.current - 25.hours)
        project_report_creator = instance_double(ProjectReportCreator)
        allow(ProjectReportCreator).to receive(:new).and_return(project_report_creator)
        allow(project_report_creator).to receive(:team_size).with(report).and_return(report.project_report_roles.count)
        allow(project_report_creator).to receive(:duration).with(report).and_return(work_time.duration)
        allow(project_report_creator).to receive(:cost).with(report).and_return(report.cost)

        result = described_class.new.call(report)

        expect(result).to be true
        expect(ProjectReportCreator).to have_received(:new)
        expect(project_report_creator).to have_received(:team_size)
        expect(project_report_creator).to have_received(:duration)
        expect(project_report_creator).to have_received(:cost)
      end
    end
  end
end
