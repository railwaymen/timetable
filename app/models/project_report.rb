# frozen_string_literal: true

class ProjectReport < ApplicationRecord
  include Discard::Model

  enum state: { editing: 'editing', done: 'done' }

  belongs_to :project
  has_many :combined_reports_project_reports, dependent: :restrict_with_error
  has_many :kept_combined_reports_project_reports, -> { kept }, class_name: 'CombinedReportsProjectReport',
                                                                inverse_of: :project_report
  has_many :combined_reports, through: :combined_reports_project_reports, dependent: :restrict_with_error
  has_many :project_report_roles, dependent: :destroy
  accepts_nested_attributes_for :project_report_roles

  after_discard do
    project_report_roles.discard_all
  end

  enum refresh_status: {
    fresh: 'fresh',
    in_progress: 'in_progress',
    done: 'done',
    error: 'error'
  }, _prefix: true

  validates :project, :name, presence: true
  validates :initial_body, presence: true
  validates :last_body, presence: true
  validate :body_did_not_lost_duration, on: :update
  validate :body_did_not_change_cost
  validate :discard_combined_reports_exist

  def generated?
    pdf_file_path.present? && csv_file_path.present?
  end

  def duration_without_ignored
    duration_sum - last_body.fetch('ignored', []).sum { |wt| wt['duration'].to_i }
  end

  def cost_without_ignored
    (cost - last_body.fetch('ignored', []).sum { |wt| wt['cost'].to_f }).round(2)
  end

  private

  def body_did_not_lost_duration
    sum = last_body.inject(0) do |acc, (_, value)|
      acc + value.sum { |wt| wt['duration'].to_i }
    end

    errors.add(:last_body, :changed_duration) if sum != duration_sum
  end

  def body_did_not_change_cost
    sum = last_body.inject(0.to_r) do |acc, (_, value)|
      acc + value.inject(0.to_r) { |mem, wt| mem + wt['cost'].to_f }
    end.to_f.round(2)
    errors.add(:last_body, :changed_cost) if (sum - cost).abs > 0.01
  end

  def discard_combined_reports_exist
    return if discarded_at.nil?

    errors.add(:base, :combined_reports_exist) if kept_combined_reports_project_reports.exists?
  end
end
