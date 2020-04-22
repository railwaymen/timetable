# frozen_string_literal: true

class CombinedReportsProjectReport < ApplicationRecord
  belongs_to :project_report
  belongs_to :combined_report
end
