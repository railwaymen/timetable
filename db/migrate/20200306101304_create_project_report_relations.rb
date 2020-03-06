class CreateProjectReportRelations < ActiveRecord::Migration[6.0]
  def change
    create_table :project_report_relations do |t|
      t.references :project_report, foreign_key: true
      t.references :group_project_report, foreign_key: true

      t.timestamps
    end
  end
end
