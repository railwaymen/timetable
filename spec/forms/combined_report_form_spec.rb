# frozen_string_literal: true

require 'rails_helper'
require 'sidekiq/testing'

RSpec.describe CombinedReportForm do
  describe '#validations' do
    it 'validates_currency' do
      project_report1 = create(:project_report, currency: 'USD', state: :done)
      project_report2 = create(:project_report, currency: 'PLN', state: :done)

      combined_report = CombinedReport.new(name: 'Name')
      form = CombinedReportForm.new(combined_report, [project_report1.id, project_report2.id])

      expect(form.save).to eql(false)
      expect(form.errors.details).to eql({ base: [{ error: :multiple_currencies }] })
    end

    it 'validates_project_report_state' do
      project_report1 = create(:project_report, state: :done)
      project_report2 = create(:project_report, state: :editing)

      combined_report = CombinedReport.new(name: 'Name')
      form = CombinedReportForm.new(combined_report, [project_report1.id, project_report2.id])

      expect(form.save).to eql(false)
      expect(form.errors.details).to eql({ base: [{ error: :only_done_allowed }] })
    end
  end

  describe '#copy_errors' do
    it 'copies model errors to form' do
      combined_report = CombinedReport.new
      form = CombinedReportForm.new(combined_report, [])
      result = form.save

      expect(result).to be false
      expect(form.errors.details).to eql({ name: [{ error: :blank }] })
    end
  end

  describe '#set_attributes' do
    it 'sets correct attributes' do
      days_ago = [Time.current, 1.day.ago, 2.days.ago, 3.days.ago]
      body1 = { development: [task: 'task', owner: 'Owner', duration: 200, cost: 40] }
      body2 = { development: [task: 'task', owner: 'Owner', duration: 300, cost: 60] }
      project_report1 = create(:project_report, currency: 'USD', state: :done, starts_at: days_ago[3],
                                                ends_at: days_ago[2], initial_body: body1, last_body: body1, cost: 40,
                                                duration_sum: 200)
      project_report2 = create(:project_report, currency: 'USD', state: :done, starts_at: days_ago[1],
                                                ends_at: days_ago[0], initial_body: body2, last_body: body2, cost: 60,
                                                duration_sum: 300)

      combined_report = CombinedReport.new(name: 'Name')
      CombinedReportForm.new(combined_report, [project_report1.id, project_report2.id]).save

      aggregate_failures 'set_time_range' do
        expect(combined_report.starts_at.to_i).to eql(days_ago[3].to_i)
        expect(combined_report.ends_at.to_i).to eql(days_ago[0].to_i)
      end

      aggregate_failures 'set_cost_and_duration' do
        expect(combined_report.duration_sum).to eql(500)
        expect(combined_report.cost).to eql(100)
      end

      aggregate_failures 'set_currency' do
        expect(combined_report.currency).to eql('USD')
      end
    end
  end

  describe 'workers' do
    it 'adds GenerateCombinedReportWorker job' do
      project_report = create(:project_report, state: :done)

      combined_report = CombinedReport.new(name: 'Name')

      expect do
        CombinedReportForm.new(combined_report, [project_report.id]).save
      end.to change(GenerateCombinedReportWorker.jobs, :size).by(1)
    end
  end
end
