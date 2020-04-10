# frozen_string_literal: true

class GroupProjectReport < ApplicationRecord
  has_many :project_reports, through: :project_report_relation
  belongs_to :project
end
