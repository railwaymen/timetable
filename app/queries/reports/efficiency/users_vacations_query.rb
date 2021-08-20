# frozen_string_literal: true

module Reports
  module Efficiency
    class UsersVacationsQuery
      VACATION_PROJECT_ID = ::Project.find_by(name: 'Vacation')&.id

      include Querable

      def initialize(*args)
        @users_query = UsersQuery.new(*args)
        @without_vacation_users_query = UsersQuery.new(*args).where_project_id_not(VACATION_PROJECT_ID)
      end

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
