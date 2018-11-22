class AddDefaultValueForProjectsColor < ActiveRecord::Migration[5.1]
  def change
    Project.where(color: nil).update_all(color: '000000')
    change_column_default :projects, :color, from: nil, to: '000000'
    change_column_null :projects, :color, false
  end
end
