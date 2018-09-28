json.array! @projects do |project|
  json.call project, :id, :name, :color, :active, :leader_id
  json.leader do
    if project.leader
      json.call project.leader, :id, :first_name, :last_name, :email
    end
  end
end
