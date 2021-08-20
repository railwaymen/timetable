# frozen_string_literal: true

module Reports
  module Efficiency
    module WhereConditions
      def where_wrap(*args, column:)
        sanitized = ActiveRecord::Base.sanitize_sql_array(args)

        where_wrap_conditions[column] = where_wrap_conditions[column].nil? ? [sanitized] : where_wrap_conditions[column] + [sanitized]

        self
      end

      private

      def where_wrap_conditions
        @where_wrap_conditions ||= {}
      end

      def where_wrap_clause(column)
        clause = where_wrap_conditions[column]

        return if clause.blank?

        clause.join(' AND ')
      end
    end
  end
end
