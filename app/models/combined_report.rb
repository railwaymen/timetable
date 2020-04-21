# frozen_string_literal: true

class CombinedReport < ApplicationRecord
  has_many :combined_reports_project_reports, dependent: :destroy
  has_many :project_reports, through: :combined_reports_project_reports
  belongs_to :project

  accepts_nested_attributes_for :combined_reports_project_reports

  validates :name, presence: true

  def generated?
    file_path.present?
  end
end
