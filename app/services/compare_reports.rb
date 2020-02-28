# frozen_string_literal: true

class CompareReports
  def call(report, project)
    report.duration_sum == project.work_times.active.where('work_times.starts_at BETWEEN ? AND ?', report.starts_at, report.ends_at).sum(:duration)
  end
end
