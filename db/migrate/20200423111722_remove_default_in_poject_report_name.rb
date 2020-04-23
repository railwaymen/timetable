class RemoveDefaultInPojectReportName < ActiveRecord::Migration[6.0]
  def up
    ProjectReport.where(name: '').update_all(name: 'N/A')
    change_column_default :project_reports, :name, nil
  end

  def down
    change_column_default :project_reports, :name, ''
  end
end
