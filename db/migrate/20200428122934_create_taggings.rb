class CreateTaggings < ActiveRecord::Migration[6.0]
  def change
    create_table :taggings do |t|
      t.references :tag, index: true, foreign_key: true, null: false
      t.references :taggable, polymorphic: true
      t.timestamps
    end

    add_index :taggings, [:tag_id, :taggable_id, :taggable_type], unique: true
  end
end
