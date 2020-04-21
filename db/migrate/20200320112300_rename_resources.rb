class RenameResources < ActiveRecord::Migration[6.0]
  def change
    rename_table :resources, :project_resources
    rename_column :project_resources, :resource_id, :project_resource_id
    rename_table :events, :project_resource_assignments
    rename_column :project_resource_assignments, :resource_id, :project_resource_id
  end
end
