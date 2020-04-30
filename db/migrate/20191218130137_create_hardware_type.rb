class CreateHardwareType < ActiveRecord::Migration[5.1]
  def change
    create_table :hardwares do |t|
      t.string :type, null: false, default: "laptop"
      t.string :manufacturer, null: false
      t.string :model, null: false
      t.string :serial_number, null: false
      t.belongs_to :user, foreign_key: true, on_delete: :cascade
    end
    add_index :hardwares, :serial_number, unique: true
  end
end
