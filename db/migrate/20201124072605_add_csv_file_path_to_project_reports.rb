class AddCsvFilePathToProjectReports < ActiveRecord::Migration[6.0]
  def change
    add_column :project_reports, :csv_file_path, :string
    rename_column :project_reports, :file_path, :pdf_file_path
  end
end
