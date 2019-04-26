# frozen_string_literal: true

json.projects do
  json.array! @projects do |project|
    json.call project, :id, :name, :internal, :active, :work_times_allows_task, :color, :lunch, :autofill, :count_duration
  end
end
json.tags(@tags.keys.map { |k| { key: k, value: "\##{k}" } })
