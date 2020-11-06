# frozen_string_literal: true

json.array! @project_stats do |project_stats|
  json.extract! project_stats, :name, :color
  json.id project_stats.project_id
  json.active project_stats.discarded_at.blank?
  if project_stats.leader_id
    json.leader do
      json.first_name project_stats.leader_first_name
      json.last_name project_stats.leader_last_name
      json.id project_stats.leader_id
    end
  end
  json.users project_stats.users, :id, :first_name, :last_name
end
