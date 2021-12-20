class AddOfficeWorkToWorkTimes < ActiveRecord::Migration[6.0]
  def change
    add_column :work_times, :office_work, :boolean
  end
end
