# frozen_string_literal: true

json.global_tags @global_tags, :id, :name, :use_as_default
json.projects @projects do |project|
  json.extract! project, :id, :name, :internal, :work_times_allows_task, :tags_enabled, :color, :lunch, :autofill, :count_duration
  json.active project.kept?
  json.accounting project.accounting?
  json.tags project.tags, :id, :name, :use_as_default
end
