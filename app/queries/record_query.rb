# frozen_string_literal: true

require_relative 'querable'

class RecordQuery
  include Querable

  def initialize(from:, to:, project_ids:, sort:, user_ids: [])
    @from        = from
    @to          = to
    @project_ids = project_ids
    @sort        = sort
    @user_ids    = user_ids
  end

  def results
    @results ||= execute_sql(sanitized_sql)
  end

  private

  def assign_sort
    (@sort.presence_in(%w[duration last_name]) || 'duration') == 'last_name' ? 'last_name ASC' : 'duration DESC'
  end

  def sanitized_sql
    sanitize_array [raw, @from, @to]
  end

  def projects_access
    sanitize_array(['AND projects.id IN (?)', @project_ids]) if @project_ids
  end

  def user_filter
    sanitize_array(['AND users.id IN (?)', @user_ids]) unless @user_ids.empty?
  end

  def raw; end
end
