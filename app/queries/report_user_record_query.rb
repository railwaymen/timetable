# frozen_string_literal: true

class ReportUserRecordQuery
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
    ReportUserRecord.new(row.symbolize_keys)
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
        CONCAT(users.first_name, ' ', users.last_name) AS user_name,
        projects.id AS project_id,
        users.id AS user_id,
        projects.name AS project_name,
        projects.internal,
        users.last_name,
        SUM(duration) OVER(PARTITION BY projects.id, users.id) AS time_worked,
        SUM(duration) OVER(PARTITION BY users.id) AS user_work_time
      FROM projects
      INNER JOIN work_times ON work_times.project_id = projects.id
      INNER JOIN users ON users.id = work_times.user_id
      WHERE work_times.starts_at >= ?
        AND work_times.ends_at <= ?
        AND work_times.active = 't'
        #{projects_access}
      ORDER BY last_name ASC, projects.internal ASC, time_worked DESC
    )
  end
  # rubocop:enable Metrics/MethodLength
end
