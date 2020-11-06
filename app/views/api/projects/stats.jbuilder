# frozen_string_literal: true

json.array! @project_stats do |project_stats|
  json.extract! project_stats, :name, :color, :leader_name
  json.id project_stats.project_id
  json.users project_stats.users, :id, :first_name, :last_name
end
