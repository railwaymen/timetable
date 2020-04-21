# frozen_string_literal: true

if @accounting_period
  json.accounting_period do
    json.partial! @accounting_period
  end
end
json.should_worked @should_worked
