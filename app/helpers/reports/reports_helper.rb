# frozen_string_literal: true

module Reports
  module ReportsHelper
    def generate_report_name(starts_at, ends_at, prefix: '', separator: '_')
      starts_at_year = starts_at.strftime('%Y')
      starts_at_month = starts_at.strftime('%m')
      starts_at_day = starts_at.strftime('%d')

      ends_at_year = ends_at.strftime('%Y')
      ends_at_month = ends_at.strftime('%m')
      ends_at_day = ends_at.strftime('%d')

      year = build_date_part(starts_at_year, ends_at_year, separator: separator)
      month = build_date_part(starts_at_month, ends_at_month, separator: separator)
      day = build_date_part(starts_at_day, ends_at_day, separator: separator)

      "#{prefix ? "#{prefix} " : ''}#{year} #{month} #{day}".strip
    end

    def build_date_part(starts_at, ends_at, separator:)
      starts_at == ends_at ? starts_at : "#{starts_at}#{separator}#{ends_at}"
    end
  end
end
