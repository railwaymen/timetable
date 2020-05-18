class AddNoteToProjectResourceAssignments < ActiveRecord::Migration[6.0]
  def change
    add_column :project_resource_assignments, :note, :string
  end
end
