class RemoveDateFromWorkTimes < ActiveRecord::Migration[5.1]
  def change
    remove_column :work_times, :date
  end
end
