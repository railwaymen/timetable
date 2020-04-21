# frozen_string_literal: true

require 'prawn'
require 'prawn/table'
require 'tempfile'
require 'uri'
# rubocop:disable Metrics/ClassLength
# :nocov:
class ProjectReportGenerator
  attr_reader :project_report

  STRONG_GRAY = 'B6B6B6'
  LIGHT_GRAY = 'EFEFEF'
  BORDER_COLOR = '808080'
  FORMAT_STRING = '%.2f'
  LOGO_PATH = Rails.root.join('public/images/reports_logo.jpg')
  FONT_PATH = Rails.root.join('app/assets/fonts')

  def initialize(project_report:)
    @project_report = project_report
    roles = project_report.project_report_roles
    @wage_hash = Hash[roles.map do |role|
                        [role.user_id, format(FORMAT_STRING, role.hourly_wage)]
                      end]
    @description_hash = Hash[roles.map { |role| [role.user_id, role.description] }]
    @name_hash = Hash[roles.includes(:user).map do |role|
                        [role.user_id, { name: role.user.name, anonymized_name: role.user.anonymized_name }]
                      end]
  end

  def call(file)
    generate_pdf(file.path)
  end

  private

  attr_reader :wage_hash, :name_hash, :description_hash

  def generate_pdf(file)
    Prawn::Document.generate(file) do |pdf|
      font_settings(pdf)
      report_header(pdf)
      footers = category_tables(pdf)
      summary(pdf, footers)
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

  # rubocop:disable Metrics/MethodLength
  def report_header(pdf)
    image_cell = File.file?(LOGO_PATH) ? { image: LOGO_PATH, rowspan: 2, image_width: 180 } : { content: '', rowspan: 2 }
    pdf.table([
                [
                  image_cell,
                  { content: project_report.project.name, rowspan: 2, valign: :center, size: 20 },
                  { content: project_report.name, align: :center, valign: :center }
                ],
                [{ content: [project_report.starts_at, project_report.ends_at].map { |n| n.strftime('%Y/%m/%d') }.join('-'), align: :center }]
              ]) do |t|
      t.width = pdf.bounds.width
      t.cells.border_width = 0
    end
  end
  # rubocop:enable Metrics/MethodLength

  # rubocop:disable Metrics/MethodLength
  # rubocop:disable Metrics/BlockLength
  def category_tables(pdf)
    header = allowed_categories.map { |content| { content: content.capitalize, text_color: '404040' } }
    project_report.last_body.map do |key, work_times|
      next if key == 'ignored'

      translated_key = translate_role(key)

      content = work_times.group_by { |wt| [wt['owner'], wt['user_id']] }.map do |(owner, user_id), wts|
        name = if user_id.nil? || owner != name_hash[user_id][:name]
                 +owner
               else
                 +name_hash[user_id][:anonymized_name]
               end
        if (description = description_hash[user_id]).present?
          name << "- #{description}"
        end
        if show_cost? && (wage = wage_hash[user_id])
          name << " (#{wage} #{project_report.currency}/h)"
        end
        [
          [{ colspan: header_colspan, content: name, background_color: LIGHT_GRAY, font_style: :bold }],
          header,
          *wts.map { |wt| allowed_categories.map { |k| send("format_#{k}", wt[k]) } }
        ]
      end
      sum_duration = work_times.sum { |e| e['duration'] }
      sum_cost = work_times.sum { |e| e['cost'].to_r }
      footer = ['', "#{translated_key} Total:", format_duration(sum_duration), format_cost(sum_cost)].compact.map do |str|
        { content: str, background_color: STRONG_GRAY }
      end
      footer[1][:align] = :right
      pdf.formatted_text [{ text: translated_key, size: 20, styles: [:bold] }]
      pdf.table([
                  *content.flatten(1),
                  footer.compact
                ], width: pdf.bounds.width) do |t|
        t.cells.size = 10
        t.columns(2..-1).align = :center
        t.column_widths = column_widths(pdf)
        t.cell_style = { borders: [:bottom], border_color: BORDER_COLOR }
      end
      pdf.move_down 20
      [translated_key, sum_duration, sum_cost]
    end.compact
  end
  # rubocop:enable Metrics/MethodLength
  # rubocop:enable Metrics/BlockLength

  # rubocop:disable Metrics/MethodLength
  def summary(pdf, footers)
    sum_duration = footers.sum { |footer| footer[1] }
    sum_cost = footers.sum { |footer| footer[2].to_r }
    footers.each do |el|
      el[1] = format_duration(el[1])
      el[2] = format_cost(el[2])
    end
    header = (%w[duration cost] & allowed_categories).map(&:capitalize).unshift('Category')
    summary_table = pdf.make_table(
      [
        header,
        *footers.map(&:compact),
        ['Total:', format_duration(sum_duration), format_cost(sum_cost)].compact
      ],
      position: :right,
      width: 300,
      cell_style: { borders: [:bottom], border_color: BORDER_COLOR }
    ) do
      row(0).background_color = LIGHT_GRAY
      row(0).font_style = :bold
      row(-1).background_color = STRONG_GRAY
      row(-1).font_style = :bold
      column(1..-1).align = :center
    end
    pdf.start_new_page if pdf.cursor < summary_table.height
    summary_table.draw
  end
  # rubocop:enable Metrics/MethodLength

  def format_task(task)
    return task unless task&.match?(URI::DEFAULT_PARSER.make_regexp)

    task_name = URI.parse(task).path.split('/').last
    { inline_format: true, content: %(<link href="#{task}">#{task_name}</link>) }
  rescue URI::InvalidURIError
    task
  end

  def format_description(description)
    description
  end

  SECONDS_IN_MINUTE = MINUTES_IN_HOUR = 60
  def format_duration(duration)
    minutes = (duration / SECONDS_IN_MINUTE) % MINUTES_IN_HOUR
    hours = duration / (SECONDS_IN_MINUTE * MINUTES_IN_HOUR)
    format('%<hours>02d:%<minutes>02d', hours: hours, minutes: minutes)
  end

  def format_cost(cost)
    return nil unless show_cost? # nil column will not be rendered
    return format(FORMAT_STRING, cost.round(2)) if project_report.currency.blank?

    "#{project_report.currency} #{format(FORMAT_STRING, cost.round(2))}"
  end

  CATEGORY_HEADERS = %w[task description duration cost].freeze
  def allowed_categories
    @allowed_categories ||= CATEGORY_HEADERS.select { |header| send("show_#{header}?") }
  end

  WEIGHTS = {
    'task' => 3,
    'description' => 5,
    'duration' => 1,
    'cost' => 1
  }.freeze
  def column_widths(pdf)
    return @column_widths if defined?(@column_widths)

    width = pdf.bounds.width
    weights = allowed_categories.map(&WEIGHTS)
    sum = weights.sum
    @column_widths = weights.map { |weight| ((weight.to_r / sum) * width) }
  end

  def header_colspan
    @allowed_categories.size
  end

  def show_cost?
    project_report.currency.present?
  end

  def show_duration?
    true
  end

  def show_task?
    true
  end

  def show_description?
    true
  end

  def font_path(font)
    File.join(FONT_PATH, font)
  end

  def translate_role(role)
    I18n.t(role, scope: 'apps.project_report_roles')
  end
end

# rubocop:enable Metrics/ClassLength
# :nocov:
