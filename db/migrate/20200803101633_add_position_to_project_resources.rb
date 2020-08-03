class AddPositionToProjectResources < ActiveRecord::Migration[6.0]
  def change
    add_column :project_resources, :position, :integer
  end
end
