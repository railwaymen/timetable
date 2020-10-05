class AddTagsEnabledToProjects < ActiveRecord::Migration[6.0]
  def change
    add_column :projects, :tags_enabled, :boolean, null: false, default: true
  end
end
