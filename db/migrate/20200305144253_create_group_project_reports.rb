class CreateGroupProjectReports < ActiveRecord::Migration[6.0]
  def change
    create_table :group_project_reports do |t|
      t.string :name, null: false, default: ''
      t.string :state, null: false, default: ''
      t.references :project, foreign_key: true

      t.timestamps
    end
  end
end
