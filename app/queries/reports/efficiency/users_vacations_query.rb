# frozen_string_literal: true

module Reports
  module Efficiency
    class UsersVacationsQuery
      VACATION_PROJECT_ID = ::Project.find_by(vacation: true)&.id

      include Querable

      def initialize(*args)
        @users_query = UsersQuery.new(*args)
        @without_vacation_users_query = UsersQuery.new(*args).where_project_id_not(VACATION_PROJECT_ID)
      end

      def length
        @length ||= begin
          p_length = records.first.projects&.length || 0
          r_length = records.length

          p_length * r_length + r_length
        end
      end

      alias size length

      def records
        @records ||= begin
          indexed = @without_vacation_users_query.records.index_by(&:id)

          @users_query.records.map do |record|
            record.no_vacations = indexed[record.id]
            record
          end
        end
      end
    end
  end
end
