# frozen_string_literal: true

json.call(@accounting_periods, :total_pages)
json.records do
  json.partial! 'accounting_period', collection: @accounting_periods, as: :accounting_period
end
json.recounting recounting
