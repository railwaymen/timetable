# frozen_string_literal: true

require 'prawn'
require 'prawn/table'
require 'tempfile'
require 'uri'

class CombinedReportGenerator
  STRONG_GRAY = 'B6B6B6'
  BORDER_COLOR = '808080'
  FORMAT_STRING = '%.2f'
  LOGO_PATH = Rails.root.join('public/images/reports_logo.jpg')
  FONT_PATH = Rails.root.join('app/assets/fonts')

  def initialize(combined_report)
    @combined_report = combined_report
  end

  def call(file)
    generate_pdf(file.path)
  end

  private

  def generate_pdf(file)
    Prawn::Document.generate(file) do |pdf|
      font_settings(pdf)
      report_header(pdf)
      report_table(pdf)
    end
  end

  def font_settings(pdf)
    pdf.font_families.update('Roboto' => {
      normal: 'Roboto-Regular.ttf',
      bold: 'Roboto-Bold.ttf',
      italic: 'Roboto-Italic.ttf',
      bold_italic: 'Roboto-BoldItalic.ttf'
    }.transform_values(&method(:font_path)))
    pdf.font 'Roboto'
  end

  def report_header(pdf)
    pdf.table(header_cells) do |t|
      t.width = pdf.bounds.width
      t.cells.border_width = 0
    end
  end

  def header_cells
    image_cell = File.file?(LOGO_PATH) ? { image: LOGO_PATH, rowspan: 2, image_width: 180 } : { content: '', rowspan: 2 }
    time_range = format_time_range([@combined_report.starts_at, @combined_report.ends_at])
    [
      [
        image_cell,
        { content: @combined_report.project.name, rowspan: 2, valign: :center, size: 20 },
        { content: @combined_report.name, align: :center, valign: :center }
      ],
      [{ content: time_range, align: :center }]
    ]
  end

  def report_table(pdf)
    records = @combined_report.project_reports.map do |pr|
      row = [pr.name, format_time_range([pr.starts_at, pr.ends_at]), format_duration(pr.duration_without_ignored)]
      row << format_cost(pr.cost_without_ignored) if @combined_report.currency.present?
      row
    end

    pdf.table([table_header, *records, report_summary], width: pdf.bounds.width) do |t|
      t.cells.size = 10
      t.columns(1..-1).align = :center
      t.cell_style = { borders: [:bottom], border_color: BORDER_COLOR }
    end
  end

  def table_header
    columns = ['', 'time', 'duration']
    columns << 'cost' if @combined_report.currency.present?

    columns.map { |content| { content: content.capitalize, text_color: '404040' } }
  end

  def report_summary
    footer = ['Total:', '', format_duration(@combined_report.duration_sum)]
    footer << format_cost(@combined_report.cost) if @combined_report.currency.present?
    footer.map do |str|
      { content: str, background_color: STRONG_GRAY, font_style: :bold }
    end
  end

  def format_time_range(dates)
    dates.map { |n| n.strftime('%Y/%m/%d') }.join(' - ')
  end

  SECONDS_IN_MINUTE = MINUTES_IN_HOUR = 60
  def format_duration(duration)
    minutes = (duration / SECONDS_IN_MINUTE) % MINUTES_IN_HOUR
    hours = duration / (SECONDS_IN_MINUTE * MINUTES_IN_HOUR)
    format('%<hours>02d:%<minutes>02d', hours: hours, minutes: minutes)
  end

  def format_cost(cost)
    "#{@combined_report.currency} #{format(FORMAT_STRING, cost.round(2))}"
  end

  def font_path(font)
    File.join(FONT_PATH, font)
  end
end
