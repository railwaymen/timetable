class CreateHardwareAccessories < ActiveRecord::Migration[6.0]
  def change
    create_table :hardware_accessories do |t|
      t.string :name, null: false
      t.belongs_to :hardware, foreign_key: true, on_delete: :cascade
    end
    add_index :hardware_accessories, [:name, :hardware_id], unique: true
  end
end
