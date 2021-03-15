class AddDiscardedAtToHardwareDevices < ActiveRecord::Migration[6.0]
  def change
    add_column :hardware_devices, :discarded_at, :datetime
    add_index :hardware_devices, :discarded_at
  end
end
