# frozen_string_literal: true

module Reports
  module XlsxHelper
    def duration_to_days(duration = 0)
      duration.to_f / 60 / 60 / 8
    end

    def setup_columns_width(sheet, *args)
      args.each do |argument|
        sheet.change_column_width(*argument)
      end
    end

    def calculate_days_should_work(starts_at, ends_at)
      starts_at.to_date.business_days_until(ends_at)
    end
  end
end
