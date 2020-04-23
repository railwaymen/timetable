# frozen_string_literal: true

json.vacations do |vacation_element|
  vacation_element.array! @vacations do |vacation|
    json.partial! vacation
  end
end

json.available_vacation_days @available_vacation_days
json.used_vacation_days @used_vacation_days
