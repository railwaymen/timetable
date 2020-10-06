# frozen_string_literal: true

json.id work_time.id
json.project_id work_time.project_id
json.starts_at work_time.starts_at
json.ends_at work_time.ends_at
json.duration work_time.duration
json.body sanitize(work_time.body)
json.task sanitize(work_time.task)
json.tag work_time.tag&.name
json.task_preview sanitize(task_preview_helper(work_time.task))
json.user_name work_time.user.name
json.date work_time.starts_at.to_date
