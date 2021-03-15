# frozen_string_literal: true

module Reports
  module Efficiency
    module Xlsx
      class UsersService < EfficiencyService
        include XlsxHelper

        attr_reader :collection, :buisness_days, :buisness_days_work_hours

        ATTRIBUTES = %w[name project tag billable billable_yes billable_no time percentage_of_time global_participation_percentage working_days].freeze

        def initialize(workbook: RubyXL::Workbook.new, starts_at: Time.current - 1.month, ends_at: Time.current, sheet_index: 0)
          @collection = UsersQuery.new(starts_at: starts_at, ends_at: ends_at)
          @buisness_days = calculate_days_should_work(starts_at, ends_at)
          @buisness_days_work_hours = @buisness_days * 8 * 60 * 60

          @workbook = workbook

          @sheet_index = sheet_index
          @name = generate_report_name(starts_at, ends_at, prefix: 'users')
        end

        def call # rubocop:disable Metrics/MethodLength
          return @workbook if @collection.empty?

          setup_columns_width(sheet, [0, 15], [1, 15], [4, 15], [5, 30], [6, 30])
          build_headers(elements: ATTRIBUTES)

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

        def user_cell(user:, current_row:)
          sheet.add_cell(current_row, 0, "#{user.first_name} #{user.last_name}")
          sheet.add_cell(current_row, 1, '')
          sheet.add_cell(current_row, 2, '')
          sheet.add_cell(current_row, 3, '')

          sheet.add_cell(current_row, 4, user.percentage_sum_billable[true]).set_number_format('0.00%')
          sheet.add_cell(current_row, 5, user.percentage_sum_billable[false]).set_number_format('0.00%')

          sheet.add_cell(current_row, 6, user.duration_to_days).set_number_format('[hh]:mm:ss.000')
          sheet.add_cell(current_row, 7, user.duration_to_fully_days / @buisness_days).set_number_format('0.00%')
          sheet.add_cell(current_row, 8, user.percentage_part).set_number_format('0.00%')
          sheet.add_cell(current_row, 9, @buisness_days)
        end

        def project_cell(project:, current_row:)
          sheet.add_cell(current_row, 1, project.name)
          sheet.add_cell(current_row, 2, project.tag)
          sheet.add_cell(current_row, 3, project.billable ? 'y' : 'n')
          sheet.add_cell(current_row, 6, project.project_duration_to_days).set_number_format('[hh]:mm:ss.000')
          sheet.add_cell(current_row, 7, project.percentage_part).set_number_format('0.00%')
        end
      end
    end
  end
end
