# frozen_string_literal: true

class CombinedReport < ApplicationRecord
  include Discard::Model

  has_many :combined_reports_project_reports, dependent: :destroy
  has_many :kept_combined_reports_project_reports, -> { kept }, class_name: 'CombinedReportsProjectReport',
                                                                inverse_of: :combined_report
  has_many :project_reports, through: :combined_reports_project_reports
  belongs_to :project

  after_discard do
    combined_reports_project_reports.discard_all
  end

  validates :name, presence: true

  def generated?
    file_path.present?
  end
end
