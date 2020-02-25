# frozen_string_literal: true

json.vacations do |vacation_element|
  vacation_element.array! @vacations do |vacation|
    json.id vacation.id
    json.start_date vacation.start_date
    json.end_date vacation.end_date
    json.vacation_type vacation.vacation_type
    json.status vacation.status
    json.business_days_count vacation.business_days_count
  end
end

json.available_vacation_days @available_vacation_days
json.used_vacation_days @used_vacation_days
