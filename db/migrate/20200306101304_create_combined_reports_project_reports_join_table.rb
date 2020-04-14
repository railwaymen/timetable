class CreateCombinedReportsProjectReportsJoinTable < ActiveRecord::Migration[6.0]
  def change
    create_join_table :combined_reports, :project_reports do |t|
      t.references :combined_reports, foreign_key: true, index: true
      t.references :project_reports, foreign_key: true, index: true

      t.timestamps
    end
  end
end
