# frozen_string_literal: true

class ReportsComparator
  def call(report, project)
    generated_duration(report) == synchornized_duration(project, report)
  end

  private

  def synchornized_duration(project, report)
    project
      .work_times
      .active
      .where('work_times.starts_at BETWEEN ? AND ?', report.starts_at, report.ends_at)
      .sum(:duration)
  end

  def generated_duration(report)
    report.duration_sum
  end
end
