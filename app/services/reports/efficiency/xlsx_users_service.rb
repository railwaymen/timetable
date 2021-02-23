# frozen_string_literal: true

module Reports
  module Efficiency
    class XlsxUsersService
      include XlsxHelper

      ATTRIBUTES = %w[name project tag billable time percentage_of_time].freeze

      def initialize(workbook: RubyXL::Workbook.new, starts_at: Time.current - 1.month, ends_at: Time.current, sheet_index: 0)
        @collection = UsersQuery.new(starts_at: starts_at, ends_at: ends_at)
        @workbook = workbook

        @sheet_index = sheet_index
      end

      def sheet
        @sheet ||= @workbook.worksheets[@sheet_index] || @workbook.add_worksheet('users')
      end

      def call # rubocop:disable Metrics/MethodLength
        return @workbook if @collection.empty?

        setup_columns_width(sheet, [0, 15], [1, 15], [4, 15], [5, 30])
        headers

        current_row = 1

        @collection.each do |user|
          user_cell(user: user, current_row: current_row)
          current_row += 1

          user.projects.each do |project|
            project_cell(project: project, current_row: current_row)
            current_row += 1
          end
        end

        @workbook
      end

      private

      def headers
        ATTRIBUTES.each_with_index { |attribute, i| sheet.add_cell(0, i, attribute) }
      end

      def user_cell(user:, current_row:)
        sheet.add_cell(current_row, 0, "#{user.first_name} #{user.last_name}")
        sheet.add_cell(current_row, 1, '')
        sheet.add_cell(current_row, 2, '')
        sheet.add_cell(current_row, 3, '')
        sheet.add_cell(current_row, 4, user.duration_to_days).set_number_format('[hh]:mm:ss.000')
        sheet.add_cell(current_row, 5, user.percentage_part).set_number_format('0.00%')
      end

      def project_cell(project:, current_row:)
        sheet.add_cell(current_row, 1, project.name)
        sheet.add_cell(current_row, 2, project.tag)
        sheet.add_cell(current_row, 3, project.billable ? 'y' : 'n')
        sheet.add_cell(current_row, 4, project.project_duration_to_days).set_number_format('[hh]:mm:ss.000')
        sheet.add_cell(current_row, 5, project.percentage_part).set_number_format('0.00%')
      end
    end
  end
end
