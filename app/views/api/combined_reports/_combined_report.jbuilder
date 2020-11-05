# frozen_string_literal: true

json.extract! combined_report, :id, :project_id, :name, :starts_at, :ends_at, :duration_sum, :cost, :currency
json.generated combined_report.generated?
