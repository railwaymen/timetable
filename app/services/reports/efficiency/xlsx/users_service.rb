# frozen_string_literal: true

module Reports
  module Efficiency
    module Xlsx
      class UsersService < EfficiencyService # rubocop:disable Metrics/ClassLength
        include XlsxHelper
        include XlsxCellsHelper

        attr_reader :collection, :collection_length, :buisness_days, :buisness_days_work_hours

        VACATION_ATTRIBUTES = %w[
          hrs_no_vacation
          billable_yes
          billable_no
          h_billable_yes
          h_billable_no
        ].freeze

        ATTRIBUTES = (
          %w[
            name department project tag billable billable_yes billable_no time percentage_of_time global_participation_percentage working_days
          ] + VACATION_ATTRIBUTES
        ).freeze

        def initialize(workbook: RubyXL::Workbook.new, starts_at: Time.current - 1.month, ends_at: Time.current, sheet_index: 0)
          @collection = UsersVacationsQuery.new(starts_at: starts_at, ends_at: ends_at)
          @buisness_days = calculate_days_should_work(starts_at, ends_at)
          @buisness_days_work_hours = @buisness_days * 8 * 60 * 60

          @starts_at = starts_at
          @ends_at = ends_at

          @workbook = workbook
          @collection_length = collection.length + 2

          @sheet_index = sheet_index
          @name = generate_report_name(starts_at, ends_at, prefix: 'crew')
        end

        def call # rubocop:disable Metrics/MethodLength
          return @workbook if @collection.empty?

          setup_columns_width(sheet, [A, 15], [B, 15], [C, 15], [E, 15], [F, 30], [G, 30], [J, 30], [K, 30], [L, 30], [M, 30], [N, 30])
          build_headers(elements: ATTRIBUTES)

          current_row = 1

          @collection.each do |user|
            user_cell(user: user, current_row: current_row)
            current_row += 1

            user.projects.each do |project|
              project_cell(user: user, project: project, current_row: current_row)
              current_row += 1
            end
          end

          current_row += 1
          users_aggregator(current_row)

          @workbook
        end

        private

        def users_aggregator(current_row = 0) # rubocop:disable Metrics/MethodLength
          sheet.add_cell(current_row, A, 'user_sum')
          sheet.add_cell(current_row, B, '', subtotal_formula_cell('H', 9)).set_number_format('[hh]:mm:ss.000')

          sheet.add_cell(current_row, E, 'AVG:')
          sheet.add_cell(current_row, F, '', subtotal_formula_cell('F')).set_number_format('0.00%')
          sheet.add_cell(current_row, G, '', subtotal_formula_cell('G')).set_number_format('0.00%')
          sheet.add_cell(current_row, H, '', subtotal_formula_cell('H')).set_number_format('[hh]:mm:ss.000')
          sheet.add_cell(current_row, I, '', subtotal_formula_cell('I')).set_number_format('0.00%')
          sheet.add_cell(current_row, J, '', subtotal_formula_cell('J')).set_number_format('0.00%')
          sheet.add_cell(current_row, K, '', subtotal_formula_cell('K'))
          sheet.add_cell(current_row, L, '', subtotal_formula_cell('L')).set_number_format('[hh]:mm:ss.000')
          sheet.add_cell(current_row, M, '', subtotal_formula_cell('M')).set_number_format('0.00%')
          sheet.add_cell(current_row, N, '', subtotal_formula_cell('N')).set_number_format('0.00%')
          sheet.add_cell(current_row, O, '', subtotal_formula_cell('O')).set_number_format('0.00%')
          sheet.add_cell(current_row, P, '', subtotal_formula_cell('P')).set_number_format('0.00%')

          current_row += 1
          sheet.add_cell(current_row, A, 'required_sum')
          sheet.add_cell(current_row, B, '', "(SUBTOTAL(9,K2:K#{@collection_length})*8)/24").set_number_format('[hh]:mm:ss.000')

          sheet.add_cell(current_row, E, 'SUM:')
          sheet.add_cell(current_row, F, '', subtotal_formula_cell('F', 9)).set_number_format('0.00%')
          sheet.add_cell(current_row, G, '', subtotal_formula_cell('G', 9)).set_number_format('0.00%')
          sheet.add_cell(current_row, H, '', subtotal_formula_cell('H', 9)).set_number_format('[hh]:mm:ss.000')
          sheet.add_cell(current_row, I, '', subtotal_formula_cell('I', 9)).set_number_format('0.00%')
          sheet.add_cell(current_row, J, '', subtotal_formula_cell('J', 9)).set_number_format('0.00%')
          sheet.add_cell(current_row, K, '', subtotal_formula_cell('K', 9))
          sheet.add_cell(current_row, L, '', subtotal_formula_cell('L', 9)).set_number_format('[hh]:mm:ss.000')
          sheet.add_cell(current_row, M, '', subtotal_formula_cell('M', 9)).set_number_format('0.00%')
          sheet.add_cell(current_row, N, '', subtotal_formula_cell('N', 9)).set_number_format('0.00%')
          sheet.add_cell(current_row, O, '', subtotal_formula_cell('O', 9)).set_number_format('0.00%')
          sheet.add_cell(current_row, P, '', subtotal_formula_cell('P', 9)).set_number_format('0.00%')

          current_row += 1
          sheet.add_cell(current_row, A, 'total time')
          sheet.add_cell(current_row, B, '', "B#{current_row - 1} - B#{current_row}").set_number_format('[hh]:mm:ss.000')

          current_row += 2
          sheet.add_cell(current_row, E, 'AVG')

          current_row += 1
          generate_row_avg_group(row: current_row, label: 'DEV', department: 'dev')
          current_row += 1
          generate_row_avg_group(row: current_row, label: 'PM', department: 'pm')
          current_row += 1
          generate_row_avg_group(row: current_row, label: 'QA', department: 'qa')
          current_row += 1
          generate_row_avg_group(row: current_row, label: 'UX', department: 'ux')
          current_row += 1
          generate_row_avg_group(row: current_row, label: 'Other', department: 'other')

          current_row += 2

          sheet.add_cell(current_row, E, 'SUM')
          current_row += 1
          generate_row_sum_group(row: current_row, label: 'DEV', department: 'dev')
          current_row += 1
          generate_row_sum_group(row: current_row, label: 'PM', department: 'pm')
          current_row += 1
          generate_row_sum_group(row: current_row, label: 'QA', department: 'qa')
          current_row += 1
          generate_row_sum_group(row: current_row, label: 'UX', department: 'ux')
          current_row += 1
          generate_row_sum_group(row: current_row, label: 'Other', department: 'other')
        end

        def generate_row_avg_group(row:, label:, department:) # rubocop:disable Metrics/MethodLength
          sheet.add_cell(row, E, label)
          sheet.add_cell(row, F, '', generate_average_if_cell_formula('B', 'F', condition_name: department)).set_number_format('0.00%')
          sheet.add_cell(row, G, '', generate_average_if_cell_formula('B', 'G', condition_name: department)).set_number_format('0.00%')
          sheet.add_cell(row, H, '', generate_average_if_cell_formula('B', 'H', condition_name: department)).set_number_format('[hh]:mm:ss.000')
          sheet.add_cell(row, I, '', generate_average_if_cell_formula('B', 'I', condition_name: department)).set_number_format('0.00%')
          sheet.add_cell(row, J, '', generate_average_if_cell_formula('B', 'J', condition_name: department)).set_number_format('0.00%')
          sheet.add_cell(row, K, '', generate_average_if_cell_formula('B', 'K', condition_name: department))
          sheet.add_cell(row, L, '', generate_average_if_cell_formula('B', 'L', condition_name: department)).set_number_format('[hh]:mm:ss.000')
          sheet.add_cell(row, M, '', generate_average_if_cell_formula('B', 'M', condition_name: department)).set_number_format('0.00%')
          sheet.add_cell(row, N, '', generate_average_if_cell_formula('B', 'N', condition_name: department)).set_number_format('0.00%')
          sheet.add_cell(row, O, '', generate_average_if_cell_formula('B', 'O', condition_name: department)).set_number_format('0.00%')
          sheet.add_cell(row, P, '', generate_average_if_cell_formula('B', 'P', condition_name: department)).set_number_format('0.00%')
        end

        def generate_row_sum_group(row:, label:, department:) # rubocop:disable Metrics/MethodLength
          sheet.add_cell(row, E, label)
          sheet.add_cell(row, F, '', generate_sum_if_cell_formula('B', 'F', condition_name: department)).set_number_format('0.00%')
          sheet.add_cell(row, G, '', generate_sum_if_cell_formula('B', 'G', condition_name: department)).set_number_format('0.00%')
          sheet.add_cell(row, H, '', generate_sum_if_cell_formula('B', 'H', condition_name: department)).set_number_format('[hh]:mm:ss.000')
          sheet.add_cell(row, I, '', generate_sum_if_cell_formula('B', 'I', condition_name: department)).set_number_format('0.00%')
          sheet.add_cell(row, J, '', generate_sum_if_cell_formula('B', 'J', condition_name: department)).set_number_format('0.00%')
          sheet.add_cell(row, K, '', generate_sum_if_cell_formula('B', 'K', condition_name: department))
          sheet.add_cell(row, L, '', generate_sum_if_cell_formula('B', 'L', condition_name: department)).set_number_format('[hh]:mm:ss.000')
          sheet.add_cell(row, M, '', generate_sum_if_cell_formula('B', 'M', condition_name: department)).set_number_format('0.00%')
          sheet.add_cell(row, N, '', generate_sum_if_cell_formula('B', 'N', condition_name: department)).set_number_format('0.00%')
          sheet.add_cell(row, O, '', generate_sum_if_cell_formula('B', 'O', condition_name: department)).set_number_format('0.00%')
          sheet.add_cell(row, P, '', generate_sum_if_cell_formula('B', 'P', condition_name: department)).set_number_format('0.00%')
        end

        def generate_average_if_cell_formula(condition_col, calculate_col, condition_name:)
          "AVERAGEIF($#{condition_col}2:$#{condition_col}#{@collection_length},\"#{condition_name}\",#{calculate_col}2:#{calculate_col}#{@collection_length})"
        end

        def generate_sum_if_cell_formula(condition_col, calculate_col, condition_name:)
          "SUMIF($#{condition_col}2:$#{condition_col}#{@collection_length},\"#{condition_name}\",#{calculate_col}2:#{calculate_col}#{@collection_length})"
        end

        def vacation_user_cell(user:, current_row:)
          sheet.add_cell(current_row, L, user.no_vacations.duration_to_days).set_number_format('[hh]:mm:ss.000')
          sheet.add_cell(current_row, M, user.no_vacations.sum_billable[true].percentage).set_number_format('0.00%')
          sheet.add_cell(current_row, N, user.no_vacations.sum_billable[false].percentage).set_number_format('0.00%')

          sheet.add_cell(current_row, O, user.no_vacations.sum_billable[true].full_days).set_number_format('[hh]:mm:ss.000')
          sheet.add_cell(current_row, P, user.no_vacations.sum_billable[false].full_days).set_number_format('[hh]:mm:ss.000')
        end

        def user_cell(user:, current_row:)
          sheet.add_cell(current_row, A, "#{user.first_name} #{user.last_name}")
          sheet.add_cell(current_row, B, user.department)

          sheet.add_cell(current_row, F, user.sum_billable[true].percentage).set_number_format('0.00%')
          sheet.add_cell(current_row, G, user.sum_billable[false].percentage).set_number_format('0.00%')

          current_buisness_days = calculate_user_buisness_days(user)

          sheet.add_cell(current_row, H, user.duration_to_days).set_number_format('[hh]:mm:ss.000')
          sheet.add_cell(current_row, I, user.duration_to_fully_days / current_buisness_days).set_number_format('0.00%')
          sheet.add_cell(current_row, J, user.percentage_part).set_number_format('0.00%')
          sheet.add_cell(current_row, K, current_buisness_days)

          vacation_user_cell(user: user, current_row: current_row) if user.no_vacations
        end

        def project_cell(user:, project:, current_row:)
          sheet.add_cell(current_row, A, "#{user.first_name} #{user.last_name}")
          sheet.add_cell(current_row, B, user.department)
          sheet.add_cell(current_row, C, project.name)
          sheet.add_cell(current_row, D, project.tag)
          sheet.add_cell(current_row, E, project.billable ? 'y' : 'n')
          sheet.add_cell(current_row, H, project.project_duration_to_days).set_number_format('[hh]:mm:ss.000')
          sheet.add_cell(current_row, I, project.percentage_part).set_number_format('0.00%')
        end

        def calculate_user_buisness_days(user)
          return calculate_days_should_work(user.created_at, @ends_at) if user.created_at > @starts_at

          @buisness_days
        end
      end
    end
  end
end
