class AddVacationIdToWorkTimes < ActiveRecord::Migration[5.1]
  def change
    add_column :work_times, :vacation_id, :integer
    add_foreign_key :work_times, :vacations, name: 'work_times_vacation_id_fk'
  end
end
