class ChangeProjectResourceAssignmentsProjectId < ActiveRecord::Migration[6.0]
  def change
    change_column_null :project_resource_assignments, :project_id, true
  end
end
