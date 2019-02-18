# frozen_string_literal: true

json.array! @report do |user_record|
  json.project_id user_record.project_id
  json.project_name user_record.project_name
  json.project_duration user_record.project_duration
  json.user_id user_record.user_id
  json.duration user_record.duration
  json.user_name user_record.user_name
end
