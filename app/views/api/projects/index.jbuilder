# frozen_string_literal: true

json.array! @projects do |project|
  json.extract! project, :id, :leader_id, :name, :color
  json.leader_name project.leader&.name
end
