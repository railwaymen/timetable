class AddDescriptionToProjectReportRoles < ActiveRecord::Migration[5.1]
  def change
    add_column :project_report_roles, :description, :string
  end
end
