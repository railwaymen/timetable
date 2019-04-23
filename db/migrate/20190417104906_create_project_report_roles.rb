class CreateProjectReportRoles < ActiveRecord::Migration[5.1]
  def change
    create_table :project_report_roles do |t|
      t.belongs_to :project_report, foreign_key: true, null: false
      t.belongs_to :user, foreign_key: true, null: false
      t.string :role, default: 'developer', null: false

      t.index [:project_report_id, :user_id], unique: true
      t.timestamps
    end
  end
end
