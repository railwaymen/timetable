# frozen_string_literal: true

json.array! @report do |user_record|
  json.user_name      user_record.user_name
  json.project_id     user_record.project_id
  json.user_id        user_record.user_id
  json.project_name   user_record.project_name
  json.time_worked    user_record.time_worked
  json.user_work_time user_record.user_work_time
end
