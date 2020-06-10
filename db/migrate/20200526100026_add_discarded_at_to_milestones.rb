class AddDiscardedAtToMilestones < ActiveRecord::Migration[6.0]
  def change
    add_column :milestones, :discarded_at, :datetime
    add_index :milestones, :discarded_at

    rename_column :milestones, :integration_payload, :external_payload
  end
end
