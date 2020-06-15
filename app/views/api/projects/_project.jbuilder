# frozen_string_literal: true

json.call project, :id, :name, :work_times_allows_task, :external_integration_enabled, :milestones_import_enabled, :external_id, :color, :leader_id
json.active project.kept?
if project.leader
  json.leader do
    json.call project.leader, :id, :first_name, :last_name, :email
  end
end
