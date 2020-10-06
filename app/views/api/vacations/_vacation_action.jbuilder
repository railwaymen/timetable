# frozen_string_literal: true

json.user_full_name response[:vacation_interaction][:user_full_name]
json.errors response[:errors]
json.warnings response[:warnings]
json.vacation do
  json.id response[:vacation].id
  json.user_id response[:vacation].user_id
  json.full_name response[:vacation].user.to_s
  json.start_date response[:vacation].start_date
  json.end_date response[:vacation].end_date
  json.vacation_type response[:vacation].vacation_type
  json.status response[:vacation].status
  json.description response[:vacation].description if current_user.admin? || current_user.staff_manager?
end
json.previous_status response[:previous_status]
json.user_available_vacation_days response[:user_available_vacation_days]
