class AddHardwareManagerToUsers < ActiveRecord::Migration[6.0]
  def change
    add_column :users, :hardware_manager, :boolean, default: false, null: false
  end
end
