class CreateHardwareField < ActiveRecord::Migration[5.1]
  def change
    create_table :hardware_fields do |t|
      t.string :name, null: false
      t.string :value, null: false
      t.belongs_to :hardware, foreign_key: true, on_delete: :cascade
    end
    add_index :hardware_fields, [:name, :hardware_id], unique: true
  end
end
