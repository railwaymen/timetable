class AddDiscardedAtToWorkTimes < ActiveRecord::Migration[6.0]
  def change
    add_column :work_times, :discarded_at, :datetime
    add_index :work_times, :discarded_at

    add_column :users, :discarded_at, :datetime
    add_index :users, :discarded_at

    add_column :projects, :discarded_at, :datetime
    add_index :projects, :discarded_at

    add_column :remote_works, :discarded_at, :datetime
    add_index :remote_works, :discarded_at

    reversible do |dir|
      dir.up do
        WorkTime.where(active: false).update_all('discarded_at = updated_at')
        User.where(active: false).update_all('discarded_at = updated_at')
        Project.where(active: false).update_all('discarded_at = updated_at')
        RemoteWork.where(active: false).update_all('discarded_at = updated_at')
      end
    end
    
    rename_column :work_times, :active, :_active
    rename_column :users, :active, :_active
    rename_column :projects, :active, :_active
    rename_column :remote_works, :active, :_active
  end
end
