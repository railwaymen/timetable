# frozen_string_literal: true

module Reports
  module Efficiency
    class XlsxProjectsService
      include XlsxHelper

      ATTRIBUTES = ['project', 'tag', 'billable', 'time spent', '% of time of billable/nonbillable projects', '% of time of all projects'].freeze
      COLUMNS = ('A'..'Z').to_a

      attr_reader :collection

      def initialize(workbook: RubyXL::Workbook.new, starts_at: Time.current - 1.month, ends_at: Time.current, sheet_index: 0)
        @collection = ProjectsQuery.new(starts_at: starts_at, ends_at: ends_at)
        @workbook = workbook

        @work_times_duration_all = @collection[0]&.work_times_duration_all
        @work_times_duration_billable_all = @collection[0]&.work_times_duration_billable_all
        @work_times_duration_unbillable_all = @collection[0]&.work_times_duration_unbillable_all

        @sheet_index = sheet_index
      end

      def sheet
        @sheet ||= @workbook.worksheets[@sheet_index] || @workbook.add_worksheet('projects')
      end

      def call # rubocop:disable Metrics/MethodLength
        return @workbook if @collection.empty?

        build_headers

        current_row = 1

        setup_columns_width(sheet, [0, 30], [3, 15], [4, 30], [5, 30])

        @collection.each do |project|
          build_project(current_row: current_row, project: project)
          current_row += 1
        end

        build_projects_summary(current_row: current_row)
        build_billing_summary
        build_tags_summary

        @workbook
      end

      private

      def build_headers
        ATTRIBUTES.each_with_index { |attribute, i| sheet.add_cell(0, i, attribute) }
      end

      def build_project(current_row:, project:)
        sheet.add_cell(current_row, 0, project.name)
        sheet.add_cell(current_row, 1, project.tag)
        sheet.add_cell(current_row, 2, project.billable ? 'y' : 'n')
        sheet.add_cell(current_row, 3, project.project_duration_to_days).set_number_format('[hh]:mm:ss.000')
        sheet.add_cell(current_row, 4, project.billing_percentage_part).set_number_format('0.00%')
        sheet.add_cell(current_row, 5, project.percentage_part).set_number_format('0.00%')
      end

      def build_projects_summary(current_row:)
        sheet.add_cell(current_row, 0, 'sum')
        sheet.add_cell(current_row, 3, '', "sum(D1:D#{current_row})").set_number_format('[hh]:mm:ss.000')
        sheet.add_cell(current_row, 4, '', "sum(E1:E#{current_row})").set_number_format('0.00%')
        sheet.add_cell(current_row, 5, '', "sum(F1:F#{current_row})").set_number_format('0.00%')
      end

      def build_billing_summary # rubocop:disable Metrics/MethodLength
        offset = ATTRIBUTES.length + 1
        summary_current_row = 0

        sheet.add_cell(summary_current_row, offset, 'Summary')
        sheet.add_cell(summary_current_row, offset + 1, 'Hours')
        sheet.add_cell(summary_current_row, offset + 2, '%')

        summary_current_row += 1

        sheet.add_cell(summary_current_row, offset, 'y')
        sheet.add_cell(summary_current_row, offset + 1, duration_to_days(@work_times_duration_billable_all)).set_number_format('[hh]:mm:ss.000')
        sheet.add_cell(summary_current_row, offset + 2, @work_times_duration_billable_all.to_f / @work_times_duration_all).set_number_format('0.00%')

        summary_current_row += 1

        sheet.add_cell(summary_current_row, offset, 'n')
        sheet.add_cell(summary_current_row, offset + 1, duration_to_days(@work_times_duration_unbillable_all)).set_number_format('[hh]:mm:ss.000')
        sheet.add_cell(summary_current_row, offset + 2, @work_times_duration_unbillable_all.to_f / @work_times_duration_all).set_number_format('0.00%')

        summary_current_row += 1

        sheet.add_cell(summary_current_row, offset, 'total')
        sheet.add_cell(summary_current_row, offset + 1, duration_to_days(@work_times_duration_unbillable_all + @work_times_duration_billable_all)).set_number_format('[hh]:mm:ss.000')
        sheet.add_cell(summary_current_row, offset + 2, '')
      end

      def build_tags_summary # rubocop:disable Metrics/MethodLength
        offset = ATTRIBUTES.length + 5
        summary_current_row = 0

        sheet.add_cell(summary_current_row, offset, 'Tag')
        sheet.add_cell(summary_current_row, offset + 1, 'Hours')
        sheet.add_cell(summary_current_row, offset + 2, '%')

        summary_current_row += 1

        @collection.group_by(&:tag).each do |tag_name, tag_collection|
          tag_duration = tag_collection.sum(&:project_duration)

          sheet.add_cell(summary_current_row, offset, tag_name)
          sheet.add_cell(summary_current_row, offset + 1, duration_to_days(tag_duration)).set_number_format('[hh]:mm:ss.000')
          sheet.add_cell(summary_current_row, offset + 2, tag_duration.to_f / @work_times_duration_all).set_number_format('0.00%')

          summary_current_row += 1
        end

        sheet.add_cell(summary_current_row, offset, 'total')
        sheet.add_cell(summary_current_row, offset + 1, '', "sum(#{COLUMNS[offset + 1]}1:#{COLUMNS[offset + 1]}#{summary_current_row})").set_number_format('[hh]:mm:ss.000')
        sheet.add_cell(summary_current_row, offset + 2, '', "sum(#{COLUMNS[offset + 2]}1:#{COLUMNS[offset + 2]}#{summary_current_row})").set_number_format('0.00%')
      end
    end
  end
end
