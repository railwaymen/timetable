# frozen_string_literal: true

json.array! @work_times do |work_time|
  json.extract! work_time, :id, :starts_at, :ends_at, :duration, :date
  json.tag work_time.tag.name
  json.body sanitize(work_time.body)
  json.task sanitize(work_time.task)
  json.department work_time.user.department
  json.task_preview sanitize(task_preview_helper(work_time.task))
  json.user_name work_time.user.name
  json.external_id work_time.external('task_id')
end
