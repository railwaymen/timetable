# frozen_string_literal: true

require_relative 'querable'

class MilestonesQuery
  include Querable

  def initialize(project:, params: {})
    @project = project
    @params = params
  end

  def results
    if @params[:with_estimates].present?
      milestones_with_stats
    else
      simple_milestones
    end
  end

  private

  def milestones_with_stats
    Milestone.find_by_sql(sanitized_sql)
  end

  def simple_milestones
    milestones = @project.milestones.kept.order(:starts_on)
    milestones.where!(visible_on_reports: true) if @params[:only_visible].present?
    milestones
  end

  def sanitized_sql
    sanitize_array [raw, @project.id, @project.id]
  end

  def raw
    %(
      SELECT milestones.*, sum(work_times.duration) as work_times_duration FROM milestones
      LEFT OUTER JOIN work_times ON work_times.date >= milestones.starts_on AND work_times.date <= milestones.ends_on AND work_times.project_id = ?
      WHERE milestones.project_id = ?
      GROUP BY milestones.id
      ORDER BY milestones.starts_on
    )
  end
end
