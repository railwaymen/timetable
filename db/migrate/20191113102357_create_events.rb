class CreateEvents < ActiveRecord::Migration[5.1]
  def change
    create_table :events do |t|
      t.belongs_to :user, foreign_key: true, null: false
      t.belongs_to :resource, foreign_key: true, null: false
      t.belongs_to :project, foreign_key: true, null: false
      t.belongs_to :vacation, foreign_key: true
      t.datetime :starts_at, null: false
      t.datetime :ends_at, null: false
      t.string :title
      t.string :color
      t.string :resource_rid, null: false
      t.integer :type, default: 1, null: false
      t.boolean :resizable, default: true
      t.boolean :movable, default: true

      t.timestamps
    end
  end
end
