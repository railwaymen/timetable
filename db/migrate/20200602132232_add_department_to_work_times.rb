class AddDepartmentToWorkTimes < ActiveRecord::Migration[6.0]
  def up
    add_column :work_times, :department, :string
    execute <<-SQL
      UPDATE work_times
      SET department = users.department
      FROM users
      WHERE users.id = work_times.user_id
    SQL
    change_column_null :work_times, :department, false
  end

  def down
    remove_column :work_times, :department
  end
end
