# frozen_string_literal: true

json.vacation_periods do
  json.partial! 'vacation_period', collection: @vacation_periods, as: :vacation_period
end
