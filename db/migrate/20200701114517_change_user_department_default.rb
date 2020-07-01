class ChangeUserDepartmentDefault < ActiveRecord::Migration[6.0]
  def change
    change_column_default :users, :department, 'other'
  end
end
