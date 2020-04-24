class AddDiscardedAtProjectReports < ActiveRecord::Migration[6.0]
  def change
    add_column :project_reports, :discarded_at, :datetime
    add_index :project_reports, :discarded_at

    add_column :project_report_roles, :discarded_at, :datetime
    add_index :project_report_roles, :discarded_at

    add_column :combined_reports, :discarded_at, :datetime
    add_index :combined_reports, :discarded_at

    add_column :combined_reports_project_reports, :discarded_at, :datetime
    add_index :combined_reports_project_reports, :discarded_at
  end
end
