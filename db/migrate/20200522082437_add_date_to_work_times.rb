class AddDateToWorkTimes < ActiveRecord::Migration[6.0]
  def change
    add_column :work_times, :date, :date

    WorkTime.update_all('date = date(starts_at)')

    change_column_null :work_times, :date, false
  end
end
