# frozen_string_literal: true

json.array! @reports do |report|
  json.extract! report, :id, :starts_at, :ends_at, :state, :name
  json.generated report.generated?
end
