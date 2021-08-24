# frozen_string_literal: true

module Reports
  module Efficiency
    class UsersQuery
      include Enumerable
      include WhereConditions
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
                     .map(&:symbolize_keys.to_proc >> User.method(:new))
      end

      def where_project_id_not(id)
        where_wrap('projects.id != ?', id, table: :work_times_user_project)
          .where_wrap('project_id != ?', id, table: :work_times_total)
          .where_wrap('project_id != ?', id, table: :work_times_users_total)
      end

      private

      def sanitized_sql
        ActiveRecord::Base.sanitize_sql_array([sql, starts_at: @starts_at, ends_at: @ends_at])
      end

      def sql
        <<-SQL.squish
          SELECT
            users.id,
            users.first_name,
            users.last_name,
            users.department,
            MAX(work_times_users_total.sum) AS work_times_duration,
            MAX(work_times_total.sum) AS work_times_duration_all,
            json_agg(DISTINCT work_times_user_project.*) AS work_times_users_projects
          FROM users
          LEFT JOIN (
            SELECT DISTINCT
              work_times.user_id,
              projects.id,
              projects.tag,
              projects.billable,
              projects.name,
              SUM(work_times.duration) AS work_times_duration
            FROM work_times
            INNER JOIN projects ON projects.id = work_times.project_id
            WHERE work_times.starts_at >= :starts_at AND work_times.ends_at <= :ends_at AND work_times.discarded_at IS NULL
            #{where_wrap_clause(:work_times_user_project).then { _1.present? ? "AND #{_1}" : '' }}
            GROUP BY work_times.user_id, projects.id
          ) work_times_user_project ON work_times_user_project.user_id = users.id
          LEFT JOIN (
            SELECT
              SUM(work_times.duration) AS sum
            FROM work_times
            WHERE work_times.starts_at >= :starts_at AND work_times.ends_at <= :ends_at AND work_times.discarded_at IS NULL
            #{where_wrap_clause(:work_times_total).then { _1.present? ? "AND #{_1}" : '' }}
            LIMIT 1
          ) work_times_total ON true
          LEFT JOIN (
            SELECT
              work_times.user_id,
              SUM(work_times.duration) AS sum
            FROM work_times
            WHERE work_times.starts_at >= :starts_at AND work_times.ends_at <= :ends_at AND work_times.discarded_at IS NULL
            #{where_wrap_clause(:work_times_users_total).then { _1.present? ? "AND #{_1}" : '' }}
            GROUP BY work_times.user_id
          ) work_times_users_total ON work_times_users_total.user_id = users.id
          WHERE users.discarded_at IS NULL
          GROUP BY users.id
        SQL
      end
    end
  end
end
