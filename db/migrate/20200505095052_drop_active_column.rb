class DropActiveColumn < ActiveRecord::Migration[6.0]
  def change
    remove_column :projects, :_active, :boolean, null: false, default: true
    remove_column :work_times, :_active, :boolean, null: false, default: true
    remove_column :users, :_active, :boolean, null: false, default: true
    remove_column :remote_works, :_active, :boolean, null: false, default: true

  end
end
