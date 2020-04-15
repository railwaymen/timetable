class CreateCombinedReportsProjectReportsJoinTable < ActiveRecord::Migration[6.0]
  def change
    create_table :combined_reports_project_reports do |t|
      t.references :combined_report, foreign_key: true, index: true, null: false
      t.references :project_report, foreign_key: true, index: true, null: false

      t.timestamps
    end
  end
end
