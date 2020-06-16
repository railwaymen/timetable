class AddMilestonesImportEnabledToProjects < ActiveRecord::Migration[6.0]
  def change
    add_column :projects, :milestones_import_enabled, :boolean, null: false, default: false
    add_reference :projects, :milestones_import_user, foreign_key: { to_table: :users }
  end
end
