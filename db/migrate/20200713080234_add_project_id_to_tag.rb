class AddProjectIdToTag < ActiveRecord::Migration[6.0]
  def change
    add_reference :tags, :project, foreign_key: true, index: true
    add_index :tags, [:name, :project_id], unique: true
  end
end
