# frozen_string_literal: true

json.array! @reports do |report|
  json.extract! report, :id, :starts_at, :ends_at, :state, :name, :currency, :combined_reports_count
  json.duration report.duration_without_ignored
  json.cost report.cost_without_ignored.to_f
  json.generated report.generated?
end
