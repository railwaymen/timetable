class AddProjectToGroupProjectReports < ActiveRecord::Migration[6.0]
  def change
    add_reference :group_project_reports, :project, foreign_key: true
  end
end
