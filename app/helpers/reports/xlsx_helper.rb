# frozen_string_literal: true

module Reports
  module XlsxHelper
    def duration_to_days(duration = 0)
      duration.to_f / 60 / 60 / 24
    end

    def setup_columns_width(sheet, *args)
      args.each do |argument|
        sheet.change_column_width(*argument)
      end
    end
  end
end
