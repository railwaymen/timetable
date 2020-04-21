class AddDiscardedAtToProjectResources < ActiveRecord::Migration[6.0]
  def change
    add_column :project_resources, :discarded_at, :datetime
    add_index :project_resources, :discarded_at
  end
end
