class ChangeTagIdNotNull < ActiveRecord::Migration[6.0]
  def change
    WorkTime.where(tag_id: nil).update_all(tag_id: Tag.where(name: 'dev').first_or_create!(use_as_default: true).id)

    change_column_null :work_times, :tag_id, false
  end
end
