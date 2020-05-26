# frozen_string_literal: true

class Milestone < ApplicationRecord
  include Discard::Model
  store_accessor :external_payload, :id, prefix: :external
  belongs_to :project

  validates :name, presence: true

  before_save :calculate_total_estimate

  def calculate_total_estimate
    self.total_estimate = [dev_estimate, qa_estimate, ux_estimate, pm_estimate, other_estimate, external_estimate].sum
  end
end
