# frozen_string_literal: true

json.extract! tag, :id, :name
json.active tag.kept?
json.edit tag.work_times.kept.exists?
json.project do
  json.name tag.project.name
  json.id tag.project.id
end
