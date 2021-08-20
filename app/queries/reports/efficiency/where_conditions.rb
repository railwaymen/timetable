# frozen_string_literal: true

module Reports
  module Efficiency
    module WhereConditions
      def where_wrap(*args, table:)
        sanitized = ActiveRecord::Base.sanitize_sql_array(args)

        where_wrap_conditions[table] = where_wrap_conditions[table].nil? ? [sanitized] : where_wrap_conditions[table] + [sanitized]

        self
      end

      private

      def where_wrap_conditions
        @where_wrap_conditions ||= {}
      end

      def where_wrap_clause(table)
        clause = where_wrap_conditions[table]

        return if clause.blank?

        clause.join(' AND ')
      end
    end
  end
end
