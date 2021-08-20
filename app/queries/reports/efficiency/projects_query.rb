# frozen_string_literal: true

module Reports
  module Efficiency
    class ProjectsQuery
      include Enumerable
      include Querable

      def initialize(starts_at: Time.current - 1.month, ends_at: Time.current)
        @starts_at = starts_at
        @ends_at = ends_at
      end

      def [](row = 0)
        records[row]
      end

      def records
        @records ||= ActiveRecord::Base
                     .connection
                     .execute(sanitized_sql)
                     .map(&:symbolize_keys.to_proc >> Project.method(:new))
      end

      private

      def sanitized_sql
        ActiveRecord::Base.sanitize_sql_array([sql, starts_at: @starts_at, ends_at: @ends_at])
      end

      def sql
        <<-SQL.squish
          SELECT
            projects.id,
            projects.name,
            projects.tag,
            projects.billable,
            SUM(work_times.duration) AS work_times_duration,
            work_times_total.sum AS work_times_duration_all,
            work_times_total.billable_sum AS work_times_duration_billable_all,
            work_times_total.unbillable_sum AS work_times_duration_unbillable_all
          FROM projects
          INNER JOIN work_times ON work_times.project_id = projects.id
          INNER JOIN (
            SELECT
              SUM(work_times.duration) AS sum,
              SUM(work_times.duration) FILTER(WHERE billable = 't') AS billable_sum,
              SUM(work_times.duration) FILTER(WHERE billable = 'f') AS unbillable_sum
            FROM work_times
            INNER JOIN projects ON projects.id = work_times.project_id
            WHERE work_times.starts_at >= :starts_at AND work_times.ends_at <= :ends_at AND work_times.discarded_at IS NULL
          ) AS work_times_total ON true
          WHERE work_times.starts_at >= :starts_at AND work_times.ends_at <= :ends_at AND work_times.discarded_at IS NULL
          GROUP BY projects.id, work_times_total.sum, billable_sum, unbillable_sum
        SQL
      end
    end
  end
end
