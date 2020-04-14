# frozen_string_literal: true

class CombinedReport < ApplicationRecord
  has_many :project_reports, through: :combined_reports_project_reports
  belongs_to :project
end
