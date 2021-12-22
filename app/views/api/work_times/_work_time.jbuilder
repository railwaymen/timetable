# frozen_string_literal: true

json.extract! work_time, :id, :tag_id
json.updated_by_admin work_time.updated_by_admin
json.project_id work_time.project_id
json.starts_at work_time.starts_at
json.ends_at work_time.ends_at
json.duration work_time.duration
json.date work_time.date
json.body sanitize(work_time.body)
json.task sanitize(work_time.task)
json.tag work_time.tag.name
json.task_preview sanitize(task_preview_helper(work_time.task))
json.user_id work_time.user_id
json.editable current_user.admin? || !work_time.project.accounting?
json.project_editable work_time.task.blank? && work_time.tag.global?
json.office_work work_time.office_work
json.project do
  json.extract! work_time.project, :id, :name, :color, :work_times_allows_task, :internal, :lunch, :count_duration
  json.accounting work_time.project.accounting?
  json.set! :taggable, work_time.project.tags_enabled?
end
