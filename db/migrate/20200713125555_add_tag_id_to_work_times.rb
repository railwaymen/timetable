class AddTagIdToWorkTimes < ActiveRecord::Migration[6.0]
  def change
    add_reference :work_times, :tag, foreign_key: true, index: true
  end
end
