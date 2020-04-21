# frozen_string_literal: true

json.array! @project_stats do |project_stats|
  json.extract! project_stats, :project_id, :name, :color, :leader_first_name, :leader_last_name
  json.users project_stats.users, :id, :first_name, :last_name
end
