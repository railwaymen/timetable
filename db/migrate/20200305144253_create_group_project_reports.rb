class CreateGroupProjectReports < ActiveRecord::Migration[6.0]
  def change
    create_table :group_project_reports do |t|
      t.string :name, null: false, default: ''
      t.string :state, null: false, default: ''

      t.timestamps
    end
  end
end
