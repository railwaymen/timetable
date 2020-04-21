# frozen_string_literal: true

json.partial! @work_time
json.sum_duration @work_time_duration

json.versions @work_time.versions do |version|
  json.event version.event
  json.updated_by User.find(version.whodunnit).to_s
  json.created_at version.created_at
  json.project_name_was version.reify.project.name if version.reify.try(:project_id)
  json.project_name Project.find(version.changeset['project_id'].last).name if version.changeset['project_id'].try(:last)
  json.body_was version.reify.try(:body)
  json.body version.changeset['body'].last if version.changeset.include?('body')
  json.starts_at_was version.reify.try(:starts_at)
  json.tag_was version.reify.try(:tag)
  json.tag version.changeset['tag'].last if version.changeset.include?('tag')
  json.task_was version.reify.try(:task)
  json.task version.changeset['task'].last if version.changeset.include?('task')
  json.starts_at version.changeset['starts_at'].last if version.changeset.include?('starts_at')
  json.ends_at_was version.reify.try(:ends_at)
  json.ends_at version.changeset['ends_at'].last if version.changeset.include?('ends_at')
  json.duration_was version.reify.try(:duration)
  json.duration version.changeset['duration'].last if version.changeset.include?('duration')
  json.task_preview_was sanitize(task_preview_helper(version.reify.try(:task)))
  json.task_preview sanitize(task_preview_helper(version.changeset['task'].last)) if version.changeset.include?('task')
end
