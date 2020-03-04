# frozen_string_literal: true

class ReportsComparator
  def call(report)
    report.project_report_roles.size == project_report_creator.team_size(report) &&
      report.duration_sum == project_report_creator.duration(report) &&
      report.cost == project_report_creator.cost(report)
  end

  private

  def project_report_creator
    @project_report_creator ||= ProjectReportCreator.new
  end
end
