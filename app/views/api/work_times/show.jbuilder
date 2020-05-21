# frozen_string_literal: true

json.partial! @work_time
json.sum_duration @work_time_duration

json.versions @work_time.versions do |version|
  work_time_version = version.next ? version.next.reify : version.item
  json.partial! 'work_time', work_time: work_time_version
  json.changeset version.changeset.keys
  json.event version.event
  json.updated_by User.find(version.whodunnit).to_s
  json.created_at version.created_at
end
