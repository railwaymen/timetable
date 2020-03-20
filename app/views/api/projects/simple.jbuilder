# frozen_string_literal: true

json.array! @projects do |project|
  json.extract! project, :id, :name, :internal, :active, :work_times_allows_task, :color, :lunch, :autofill, :count_duration
  json.taggable project.taggable?
end
