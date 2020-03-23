class CreateRemoteWorks < ActiveRecord::Migration[6.0]
  def change
    create_table :remote_works do |t|
      t.references :user, foreign_key: true, index: true, null: false
      t.references :creator, foreign_key: { to_table: :users }, null: false
      t.datetime :starts_at, null: false
      t.datetime :ends_at, null: false
      t.integer :duration, default: 0, null: false
      t.text :note
      t.boolean :active, default: true, null: false
      t.boolean :updated_by_admin, default: false, null: false

      t.timestamps
    end
  end
end
