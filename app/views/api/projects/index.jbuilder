# frozen_string_literal: true

json.array! @projects do |project|
  json.id project.id
  json.project_id project.project_id
  json.name project.name
  json.color project.color
  json.user do
    json.name "#{project.user_first_name} #{project.user_last_name}"
  end
  json.leader do
    if project.leader_first_name
      json.name "#{project.leader_first_name} #{project.leader_last_name}"
    end
  end
end
