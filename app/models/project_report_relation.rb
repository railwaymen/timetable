class ProjectReportRelation < ApplicationRecord
  belongs_to :project_report
  belongs_to :group_project_report
end
