# frozen_string_literal: true

class CombinedReportsProjectReport < ApplicationRecord
  include Discard::Model

  belongs_to :project_report
  belongs_to :combined_report
end
