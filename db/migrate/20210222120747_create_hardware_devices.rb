class CreateHardwareDevices < ActiveRecord::Migration[6.0]
  def change
    create_table :hardware_devices do |t|
      t.string :category, null: false
      t.string :brand, null: false
      t.string :model, null: false
      t.string :serial_number, null: false

      t.date :year_of_production, null: false
      t.date :year_bought, null: false
      t.date :used_since, null: false

      t.string :cpu
      t.string :ram
      t.string :storage
      t.string :os_version

      t.boolean :archived, null: false, default: false

      t.string :state, null: false
      t.text :note
      t.references :user, foreign_key: true, null: true

      t.timestamps
    end
  end
end
