# frozen_string_literal: true

require_relative 'querable'

class ProjectRateQuery
  UserStats = Struct.new(:id, :name, :total, keyword_init: true)
  ProjectStats = Struct.new(:project_id, :name, :users, :color, :total, :leader_name, :leader_id, :discarded_at, keyword_init: true)
  include Querable

  def initialize(starts_at: nil, ends_at: nil, visibility: 'all', type: 'all', sort: 'hours')
    @starts_at = starts_at
    @ends_at   = ends_at
    @type = type
    @visibility = visibility
    @sort = sort
  end

  def results
    project_stats = []
    execute_sql(sanitized_sql).each do |record|
      project_stat = project_stats.find { |p| p.project_id == record['project_id'] } || project_stats.push(project_stats(record)).last
      next if record['user_id'].nil?

      project_stat.users.push UserStats.new(id: record['user_id'], name: record['user_name'], total: record['total_for_user'])
    end
    project_stats
  end

  private

  def project_stats(record)
    ProjectStats.new(record.slice('project_id', 'name', 'color', 'leader_name', 'leader_id', 'discarded_at')
                .merge(total: record['total_for_project'], users: []))
  end

  def sanitized_sql
    sanitize_array [raw, @starts_at, @ends_at]
  end

  def range_condition
    sanitize_array ['starts_at >= ? AND ends_at <= ?', @starts_at, @ends_at] if @starts_at.present? && @ends_at.present?
  end

  def type_condition
    return "projects.internal = 'f'" if @type == 'commercial'
    return "projects.internal = 't'" if @type == 'internal'
  end

  def visibility_condition
    return 'projects.discarded_at IS NULL' if @visibility == 'active'
    return 'projects.discarded_at IS NOT NULL' if @visibility == 'inactive'
  end

  def where_conditions
    conditions = [visibility_condition, range_condition, type_condition].compact
    "WHERE #{conditions.join(' AND ')}" if conditions.present?
  end

  def distinct_phrase
    return 'DISTINCT ON (projects.id, work_times.user_id, total_for_user, total_for_project)' if @sort == 'hours'
    return 'DISTINCT ON (projects.name)' if @sort == 'alphabetical'
  end

  def sort_phrase
    return 'ORDER BY total_for_project DESC NULLS LAST, total_for_user DESC' if @sort == 'hours'
    return 'ORDER BY projects.name ASC' if @sort == 'alphabetical'
  end

  # rubocop:disable Metrics/MethodLength
  def raw
    %(
      SELECT #{distinct_phrase}
        work_times.id AS id,
        projects.id AS project_id,
        projects.discarded_at AS discarded_at,
        projects.color,
        projects.name,
        SUM(work_times.duration) OVER(PARTITION BY work_times.user_id, projects) AS total_for_user,
        SUM(work_times.duration) OVER(PARTITION BY projects) AS total_for_project,
        users.id AS user_id,
        users.first_name || ' ' || users.last_name as user_name,
        leaders.id as leader_id,
        leaders.first_name || ' ' || leaders.last_name as leader_name
      FROM projects
      LEFT JOIN work_times ON projects.id = work_times.project_id AND work_times.discarded_at IS NULL
      LEFT JOIN users ON users.id = work_times.user_id
      LEFT JOIN users leaders ON leaders.id = projects.leader_id
      #{where_conditions}
      #{sort_phrase}
    )
  end
  # rubocop:enable Metrics/MethodLength
end
