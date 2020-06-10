class RemovePositionFromMilestones < ActiveRecord::Migration[6.0]
  def up
    remove_column :milestones, :position
  end

  def down
    add_column :milestones, :position, :integer, null: false
    add_index :milestones, [:position, :project_id], unique: true
  end
end
