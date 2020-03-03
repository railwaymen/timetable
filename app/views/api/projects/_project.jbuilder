# frozen_string_literal: true

json.call project, :id, :name, :work_times_allows_task, :external_integration_enabled, :color, :active, :leader_id
if project.leader
  json.leader do
    json.call project.leader, :id, :first_name, :last_name, :email
  end
end
