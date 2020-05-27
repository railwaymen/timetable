class AddDepartmentToUsers < ActiveRecord::Migration[6.0]
  def change
    add_column :users, :department, :string
    User.update_all(department: :other)
    change_column_null :users, :department, false
  end
end
