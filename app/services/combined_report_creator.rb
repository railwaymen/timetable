# frozen_string_literal: true

class CombinedReportCreator
  def initialize(combined_report, project_report_ids)
    @combined_report = combined_report
    @project_report_ids = project_report_ids
    @project_reports = ProjectReport.where(id: @project_report_ids)

    raise 'Incorrect values for project_report_ids' if @project_report_ids.length != @project_reports.length
    raise 'Only done reports are allowed ' if @project_reports.where.not(state: :done).exists?
  end

  def call
    set_time_range
    set_cost_and_duration
    set_currency
    @combined_report.save!

    @project_report_ids.each do |id|
      @combined_report.combined_reports_project_reports.create!(project_report_id: id)
    end
  end

  private

  def set_time_range
    @combined_report.starts_at = @project_reports.minimum(:starts_at)
    @combined_report.ends_at = @project_reports.maximum(:ends_at)
  end

  def set_cost_and_duration
    attributes = { duration_sum: 0, cost: 0 }
    @project_reports.each do |pr|
      attributes[:duration_sum] += pr.duration_without_ignored
      attributes[:cost] += pr.cost_without_ignored
    end

    @combined_report.assign_attributes(attributes)
  end

  def set_currency
    currencies = @project_reports.pluck(:currency).uniq
    raise 'Multiple currencies are not allowed' if currencies.length > 1

    @combined_report.currency = currencies.first
  end
end
