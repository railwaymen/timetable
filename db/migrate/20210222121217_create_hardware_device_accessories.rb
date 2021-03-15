class CreateHardwareDeviceAccessories < ActiveRecord::Migration[6.0]
  def change
    create_table :hardware_device_accessories do |t|
      t.string :name, null: false
      t.integer :quantity, null: false, default: 1
      t.references :hardware_device, foreign_key: true, null: false

      t.timestamps
    end
  end
end
