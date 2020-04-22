# frozen_string_literal: true

class CombinedReportForm
  include ActiveModel::Validations

  attr_reader :combined_report

  delegate :name, to: :combined_report

  validate :validates_currency
  validate :validates_project_report_state

  def initialize(combined_report, project_report_ids)
    @combined_report = combined_report
    @project_report_ids = project_report_ids
    @project_reports = ProjectReport.where(id: @project_report_ids)

    raise 'Incorrect values for project_report_ids' if @project_report_ids.length != @project_reports.length
  end

  def save
    unless [@combined_report.valid?, valid?].all?
      copy_errors
      return false
    end

    set_attributes
    @combined_report.save!

    @project_report_ids.each do |id|
      @combined_report.combined_reports_project_reports.create!(project_report_id: id)
    end

    GenerateCombinedReportWorker.perform_async(@combined_report.id)
  end

  private

  def validates_currency
    currencies = @project_reports.pluck(:currency).uniq
    errors.add(:base, :multiple_currencies) if currencies.length > 1
  end

  def validates_project_report_state
    errors.add(:base, :only_done_allowed) if @project_reports.where.not(state: :done).exists?
  end

  def set_attributes
    set_time_range
    set_cost_and_duration
    set_currency
  end

  def set_time_range
    @combined_report.starts_at = @project_reports.minimum(:starts_at)
    @combined_report.ends_at = @project_reports.maximum(:ends_at)
  end

  def set_cost_and_duration
    attributes = { duration_sum: 0, cost: 0 }
    @project_reports.each do |pr|
      attributes[:duration_sum] += pr.duration_without_ignored
      attributes[:cost] += pr.cost_without_ignored
    end

    @combined_report.assign_attributes(attributes)
  end

  def set_currency
    currencies = @project_reports.pluck(:currency).uniq
    @combined_report.currency = currencies.first
  end

  def copy_errors
    @combined_report.errors.details.each do |key, value|
      errors.add(key, value.first[:error], value.first.except(:error))
    end
  end
end
