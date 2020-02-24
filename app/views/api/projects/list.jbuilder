# frozen_string_literal: true

json.array! @projects do |project|
  json.call project, :id, :name, :color, :active, :leader_id
  json.leader do
    json.call project.leader, :id, :first_name, :last_name, :email if project.leader
  end
end
