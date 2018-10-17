# frozen_string_literal: true

class ReportProjectRecordQuery
  def initialize(from:, to:, project_ids:)
    @from        = from
    @to          = to
    @project_ids = project_ids
  end

  def results
    @results ||= ActiveRecord::Base.connection.execute(sanitized_sql).map(&method(:assign_to_class))
  end

  private

  def assign_to_class(row)
    ReportProjectRecord.new(row.symbolize_keys)
  end

  def sanitized_sql
    ActiveRecord::Base.send :sanitize_sql_array, [raw, @from, @to]
  end

  def projects_access
    ActiveRecord::Base.send(:sanitize_sql_array, ['AND projects.id IN (?)', @project_ids]) if @project_ids
  end

  # rubocop:disable Metrics/MethodLength
  def raw
    %(
      SELECT DISTINCT
        projects.id AS project_id,
        projects.name AS project_name,
        work_times.user_id AS user_id,
        SUM(work_times.duration) OVER(PARTITION BY projects.id, work_times.user_id) AS duration,
        SUM(work_times.duration) OVER(PARTITION BY projects.id) AS project_duration,
        CONCAT(users.last_name, ' ', users.first_name) AS user_name
      FROM projects
      INNER JOIN work_times ON projects.id = work_times.project_id
      INNER JOIN users ON users.id = work_times.user_id
      WHERE work_times.starts_at >= ?
        AND work_times.ends_at <= ?
        AND work_times.active = 't'
        #{projects_access}
      ORDER BY project_name ASC, duration DESC
    )
  end
  # rubocop:enable Metrics/MethodLength
end
