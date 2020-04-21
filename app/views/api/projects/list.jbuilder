# frozen_string_literal: true

json.array! @projects do |project|
  json.call project, :id, :name, :color, :leader_id
  json.active project.kept?
  json.leader do
    json.call project.leader, :id, :first_name, :last_name, :email if project.leader
  end
end
