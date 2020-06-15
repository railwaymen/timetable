# frozen_string_literal: true

json.extract! project_resource_assignment, :id, :note, :type, :resizable, :movable, :title
json.start project_resource_assignment.starts_at.to_date
json.end project_resource_assignment.ends_at.to_date
json.resourceId project_resource_assignment.resource_rid
json.projectId project_resource_assignment.project_id
json.resourceRealId project_resource_assignment.project_resource_id
