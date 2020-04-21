class AddDiscardedAtToProjectResourceAssignments < ActiveRecord::Migration[6.0]
  def change
    add_column :project_resource_assignments, :discarded_at, :datetime
    add_index :project_resource_assignments, :discarded_at
  end
end
