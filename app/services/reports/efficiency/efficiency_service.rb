# frozen_string_literal: true

module Reports
  module Efficiency
    class EfficiencyService
      include XlsxHelper
      include ReportsHelper

      def sheet
        @sheet ||= begin
          found = @workbook.worksheets[@sheet_index]
          return @workbook.add_worksheet(@name) unless found

          found.sheet_name = @name
          found
        end
      end

      def build_headers(elements:)
        elements.each_with_index { |attribute, i| sheet.add_cell(0, i, attribute) }
      end
    end
  end
end
