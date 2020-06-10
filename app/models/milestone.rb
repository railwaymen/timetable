# frozen_string_literal: true

class Milestone < ApplicationRecord
  include Discard::Model
  store_accessor :external_payload, :id, prefix: :external
  has_many :estimates, class_name: 'MilestoneEstimate', dependent: :destroy
  belongs_to :project

  validates :name, presence: true
  validates :starts_on, presence: true, if: :visible_on_reports?

  before_save :calculate_total_estimate

  def calculate_total_estimate
    self.total_estimate = [dev_estimate, qa_estimate, ux_estimate, pm_estimate, other_estimate, external_estimate].sum
  end

  def any_estimate_changed?
    [dev_estimate_changed?, qa_estimate_changed?, ux_estimate_changed?, pm_estimate_changed?, other_estimate_changed?].any?
  end

  def opened?
    !closed?
  end

  def overlaps_with_other?
    project.milestones.reject { |m| m.id == id }.any? do |milestone|
      (starts_on && ends_on && milestone.starts_on && milestone.ends_on && (starts_on..ends_on).cover?(milestone.starts_on..milestone.ends_on)) ||
        (starts_on && ends_on && milestone.starts_on && (starts_on..ends_on).cover?(milestone.starts_on))
    end
  end
end
