class AddPotentialProjectNameToProjectResourceAssignments < ActiveRecord::Migration[6.0]
  def change
    add_column :project_resource_assignments, :potential_project_name, :string
  end
end
