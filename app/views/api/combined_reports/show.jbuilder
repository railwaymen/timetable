# frozen_string_literal: true

json.partial! 'combined_report', combined_report: @combined_report
json.project_reports do
  json.array! @project_reports do |report|
    json.extract! report, :id, :project_id, :state, :starts_at, :ends_at, :currency, :name, :combined_reports_count
    json.duration report.duration_without_ignored
    json.cost report.cost_without_ignored.to_f
  end
end
