# frozen_string_literal: true

require 'prawn'
require 'prawn/table'
require 'tempfile'
require 'uri'
# rubocop:disable ClassLength
class ProjectReportGenerator
  attr_reader :project_report

  STRONG_GRAY = 'F6F6F6'
  LIGHT_GRAY = 'FBFBFB'
  TABLE_WIDTH = 523
  FORMAT_STRING = '%.2f'

  def initialize(project_report:)
    @project_report = project_report
    @wage_hash = Hash[
      project_report.project_report_roles.includes(:user).map do |role|
        ["#{role.user.first_name} #{role.user.last_name}", format(FORMAT_STRING, role.hourly_wage)]
      end
    ]
  end

  def call
    file = Tempfile.new([file_name, '.pdf'])
    generate_pdf(file.path)
    file
  end

  private

  attr_reader :wage_hash

  def generate_pdf(file)
    Prawn::Document.generate(file) do |pdf|
      report_header(pdf)
      footers = category_tables(pdf)
      summary(pdf, footers)
    end
  end

  # rubocop:disable MethodLength
  def report_header(pdf)
    pdf.table([
                [
                  { image: './logo.jpg', rowspan: 2, image_width: 180 },
                  { content: project_report.project.name, rowspan: 2, valign: :center, size: 20 },
                  { content: project_report.name, align: :center, valign: :center }
                ],
                [{ content: [project_report.starts_at, project_report.ends_at].map { |n| n.strftime('%Y/%m/%d') }.join('-'), align: :center }]
              ]) do |t|
      t.width = TABLE_WIDTH
      t.cells.border_width = 0
    end
  end
  # rubocop:enable MethodLength

  CATEGORY_HEADERS = %w[task description duration cost].freeze
  # rubocop:disable MethodLength
  # rubocop:disable BlockLength
  def category_tables(pdf)
    header = CATEGORY_HEADERS.map { |content| { content: content.capitalize, background_color: LIGHT_GRAY, font_style: :bold } }
    project_report.last_body.map do |key, work_times|
      next if key == 'ignored'

      content = work_times.group_by { |wt| wt['owner'] }.map do |owner, wts|
        name = if (wage = wage_hash[owner])
                 "#{owner} (#{wage} #{project_report.currency}/h)"
               else
                 owner
               end
        [
          [{ colspan: 4, content: name, align: :center, background_color: STRONG_GRAY, font_style: :bold }],
          header,
          *wts.map { |wt| CATEGORY_HEADERS.map { |k| send("format_#{k}", wt[k]) } }
        ]
      end
      sum_duration = work_times.sum { |e| e['duration'] }
      sum_cost = work_times.sum { |e| e['cost'].to_r }
      footer = ['', '', format_duration(sum_duration), format_cost(sum_cost)].map do |str|
        { content: str, background_color: STRONG_GRAY }
      end
      pdf.table([
                  [{ content: key.upcase, size: 25, colspan: 4, font_style: :bold }],
                  *content.flatten(1),
                  footer
                ], width: TABLE_WIDTH) do
        cells.size = 10
        column(2..-1).width = 65
        columns(2..-1).align = :center
      end
      pdf.move_down 20
      [key, sum_duration, sum_cost]
    end.compact
  end
  # rubocop:enable MethodLength
  # rubocop:enable BlockLength

  # rubocop:disable MethodLength
  def summary(pdf, footers)
    sum_duration = footer.sum { |footer| footer[1] }
    sum_cost = footers.sum { |footer| footer[2].to_r }
    footers.each do |el|
      el[1] = format_duration(el[1])
      el[2] = format_cost(el[2])
    end
    pdf.table([
                %w[Type Duration Cost],
                *footers,
                ['Sum', format_duration(sum_duration), format_cost(sum_cost)]
              ], position: :right, width: 300) do
      row(0).background_color = LIGHT_GRAY
      row(0).font_style = :bold
      row(-1).background_color = STRONG_GRAY
      row(-1).font_style = :bold
    end
  end
  # rubocop:enable MethodLength

  def format_task(task)
    return task unless task =~ URI::DEFAULT_PARSER.make_regexp

    task_name = URI.parse(task).path.split('/').last
    { inline_format: true, content: %(<link href="#{task}">#{task_name}</link>) }
  end

  def format_description(task)
    task.to_s
  end

  SECONDS_IN_MINUTE = MINUTES_IN_HOUR = 60
  def format_duration(duration)
    minutes = (duration / SECONDS_IN_MINUTE) % MINUTES_IN_HOUR
    hours = duration / (SECONDS_IN_MINUTE * MINUTES_IN_HOUR)
    format('%02d:%02d', hours, minutes)
  end

  def format_cost(cost)
    return format(FORMAT_STRING, cost.round(2)) if project_report.currency.blank?

    "#{project_report.currency} #{format(FORMAT_STRING, cost.round(2))}"
  end

  def file_name
    "#{project_report.project.name.gsub(/\s+/, '_')}_#{@project_report.name}"
  end
end

# rubocop:enable ClassLength
