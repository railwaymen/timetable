class FixUniqueIndexOnTags < ActiveRecord::Migration[6.0]
  def up
    remove_index :tags, [:name, :project_id]
    remove_index :tags, :name
    add_index :tags, [:project_id, :name], unique: true, where: 'discarded_at IS NULL'
  end

  def down
    add_index :tags, [:name, :project_id], unique: true
    add_index :tags, :name, unique: true
    remove_index :tags, [:project_id, :name]
  end
end
