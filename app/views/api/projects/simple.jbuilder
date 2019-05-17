# frozen_string_literal: true

json.projects do
  json.array! @projects do |project|
    json.call project, :id, :name, :internal, :active, :work_times_allows_task, :color, :lunch, :autofill, :count_duration
    json.set! :taggable, project.taggable?
  end
end
json.tags @tags.keys
json.tags_disabled TAGS_DISABLED
