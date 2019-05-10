# frozen_string_literal: true

class ProjectReportRole < ApplicationRecord
  enum role: { developer: 'developer', qa: 'qa', ux: 'ux', pm: 'pm', ignored: 'ignored' }

  belongs_to :project_report
  belongs_to :user

  validates :role, presence: true
  validates :project_report, presence: true
  validates :user, presence: true

  validates :project_report_id, uniqueness: { scope: [:user_id] }
end
