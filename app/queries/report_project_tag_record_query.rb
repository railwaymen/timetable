# frozen_string_literal: true

require_relative 'record_query'

class ReportProjectTagRecordQuery < RecordQuery
  def results
    @results ||= super.map(&method(:assign_to_class))
  end

  private

  def assign_to_class(row)
    ReportProjectTagRecord.new(**row.symbolize_keys)
  end

  # rubocop:disable Metrics/MethodLength
  def raw
    %(
      SELECT DISTINCT
        projects.id AS project_id,
        projects.name AS project_name,
        tags.name AS tag,
        tags.id AS tag_id,
        SUM(work_times.duration) OVER(PARTITION BY projects.id, tags.name) AS duration,
        SUM(work_times.duration) OVER(PARTITION BY projects.id) AS project_duration
      FROM projects
      INNER JOIN work_times ON projects.id = work_times.project_id
      INNER JOIN users ON users.id = work_times.user_id
      INNER JOIN tags ON tags.id = work_times.tag_id
      WHERE work_times.starts_at >= ?
        AND work_times.ends_at <= ?
        AND work_times.discarded_at IS NULL
        #{projects_access}
        #{user_filter}
        #{tag_filter}
      ORDER BY project_name ASC, #{assign_sort}
    )
  end
  # rubocop:enable Metrics/MethodLength
end
