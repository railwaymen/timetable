# frozen_literal_string: true

class ProjectRateQuery
  def initialize(active:, starts_at: Time.current - 30.days, ends_at: Time.current)
    @active    = active
    @starts_at = starts_at
    @ends_at   = ends_at
  end

  def results
    ActiveRecord::Base.connection.execute(sanitized_sql).map(&method(:assign_to_class))
  end

  private

  def assign_to_class(row)
    ProjectRate.new(row.symbolize_keys)
  end

  def sanitized_sql
    ActiveRecord::Base.send :sanitize_sql_array, [raw, @active, @starts_at, @ends_at]
  end

  # rubocop:disable Metrics/MethodLength
  def raw
    %(
      SELECT DISTINCT ON (projects.id, work_times.user_id, total_for_user, total_for_project)
        work_times.id AS id,
        projects.id AS project_id,
        projects.color,
        projects.name,
        SUM(work_times.duration) OVER(PARTITION BY work_times.user_id, projects) AS total_for_user,
        SUM(work_times.duration) OVER(PARTITION BY projects) AS total_for_project,
        users.first_name AS user_first_name,
        users.last_name AS user_last_name,
        leaders.first_name AS leader_first_name,
        leaders.last_name AS leader_last_name
      FROM projects
      LEFT JOIN work_times ON projects.id = work_times.project_id
      INNER JOIN users ON users.id = work_times.user_id
      LEFT  JOIN users leaders ON leaders.id = projects.leader_id
      WHERE projects.active = ?
        AND starts_at >= ? AND ends_at <= ?
        AND projects.internal = 'f'
        AND work_times.active = 't'
      ORDER BY total_for_project DESC, total_for_user DESC
    )
  end
  # rubocop:enable Metrics/MethodLength
end
