# frozen_string_literal: true

class ReportProjectTagRecordQuery
  def initialize(from:, to:, project_ids:, sort:, user_ids: [])
    @from        = from
    @to          = to
    @project_ids = project_ids
    @sort        = sort
    @user_ids    = user_ids
  end

  def results
    @results ||= ActiveRecord::Base.connection.execute(sanitized_sql).map(&method(:assign_to_class))
  end

  private

  def assign_sort
    (@sort.presence_in(%w[duration last_name]) || 'duration') == 'last_name' ? 'last_name ASC' : 'duration DESC'
  end

  def assign_to_class(row)
    ReportProjectTagRecord.new(row.symbolize_keys)
  end

  def sanitized_sql
    ActiveRecord::Base.send :sanitize_sql_array, [raw, @from, @to]
  end

  def projects_access
    ActiveRecord::Base.send(:sanitize_sql_array, ['AND projects.id IN (?)', @project_ids]) if @project_ids
  end

  def user_filter
    ActiveRecord::Base.send(:sanitize_sql_array, ['AND users.id IN (?)', @user_ids]) unless @user_ids.empty?
  end

  # rubocop:disable Metrics/MethodLength
  def raw
    %(
      SELECT DISTINCT
        projects.id AS project_id,
        projects.name AS project_name,
        work_times.tag AS tag,
        SUM(work_times.duration) OVER(PARTITION BY projects.id, work_times.tag) AS duration,
        SUM(work_times.duration) OVER(PARTITION BY projects.id) AS project_duration
      FROM projects
      INNER JOIN work_times ON projects.id = work_times.project_id
      INNER JOIN users ON users.id = work_times.user_id
      WHERE work_times.starts_at >= ?
        AND work_times.ends_at <= ?
        AND work_times.active = 't'
        #{projects_access}
        #{user_filter}
      ORDER BY project_name ASC, #{assign_sort}
    )
  end
  # rubocop:enable Metrics/MethodLength
end
