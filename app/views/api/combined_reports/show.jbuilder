# frozen_string_literal: true

json.partial! 'combined_report', combined_report: @combined_report
json.project_reports do
  json.array! @project_reports do |project_report|
    json.extract! project_report, :id, :project_id, :state, :starts_at, :ends_at, :currency, :name,
                                  :combined_reports_count
    json.duration project_report.duration_without_ignored
    json.cost project_report.cost_without_ignored.to_f
  end
end
