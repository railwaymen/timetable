# frozen_string_literal: true

require_relative 'querable'

class ProjectRateQuery
  UserStats = Struct.new(:id, :first_name, :last_name, :total, keyword_init: true)
  ProjectStats = Struct.new(:project_id, :name, :users, :color, :total, :leader_first_name, :leader_last_name, keyword_init: true)
  include Querable

  def initialize(starts_at: 30.days.ago, ends_at: Time.current)
    @starts_at = starts_at
    @ends_at   = ends_at
  end

  def results
    project_stats = []
    execute_sql(sanitized_sql).each do |record|
      project_stat = project_stats.find { |p| p.project_id == record['project_id'] } || project_stats.push(project_stats(record)).last
      project_stat.users.push UserStats.new(id: record['user_id'], first_name: record['user_first_name'], last_name: record['user_last_name'], total: record['total_for_user'])
    end
    project_stats
  end

  private

  def project_stats(record)
    ProjectStats.new(record.slice('project_id', 'name', 'color', 'leader_first_name', 'leader_last_name').merge(total: record['total_for_project'], users: []))
  end

  def sanitized_sql
    sanitize_array [raw, @starts_at, @ends_at]
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
        users.id AS user_id,
        users.first_name AS user_first_name,
        users.last_name AS user_last_name,
        leaders.first_name AS leader_first_name,
        leaders.last_name AS leader_last_name
      FROM projects
      LEFT JOIN work_times ON projects.id = work_times.project_id
      INNER JOIN users ON users.id = work_times.user_id
      LEFT  JOIN users leaders ON leaders.id = projects.leader_id
      WHERE projects.discarded_at IS NULL
        AND starts_at >= ? AND ends_at <= ?
        AND projects.internal = 'f'
        AND work_times.discarded_at IS NULL
      ORDER BY total_for_project DESC, total_for_user DESC
    )
  end
  # rubocop:enable Metrics/MethodLength
end
