# frozen_string_literal: true

json.accepted_or_declined_vacations do |accepted_or_declinedvacation_element|
  accepted_or_declinedvacation_element.array! @accepted_or_declined_vacations do |vacation|
    json.id vacation['id']
    json.full_name vacation['full_name']
    json.start_date vacation['start_date']
    json.end_date vacation['end_date']
    json.vacation_type vacation['vacation_type']
    json.status vacation['status']
    json.description vacation['description']
  end
end

json.unconfirmed_vacations do |unconfirmed_vacation_element|
  unconfirmed_vacation_element.array! @unconfirmed_vacations do |vacation|
    json.id vacation['id']
    json.full_name vacation['full_name']
    json.start_date vacation['start_date']
    json.end_date vacation['end_date']
    json.vacation_type vacation['vacation_type']
    json.vacation_sub_type vacation['vacation_sub_type']
    json.status vacation['status']
    json.description vacation['description']

    json.approvers vacation['approvers']
    json.decliners vacation['decliners']
    json.interacted vacation['interacted']
    json.available_vacation_days @available_vacation_days[vacation['user_id']]
  end
end
