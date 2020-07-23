# frozen_string_literal: true

json.call(@vacation_periods, :total_pages)
json.records do
  json.partial! 'vacation_period', collection: @vacation_periods, as: :vacation_period
end
