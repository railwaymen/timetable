# frozen_string_literal: true

require 'csv'

class ProjectReportCsvGenerator
  FORMAT_STRING = '%.2f'
  attr_reader :project_report

  def initialize(project_report)
    @project_report = project_report
  end

  def call
    CSV.generate do |csv|
      generate_csv_content(csv)
    end
  end

  private

  def generate_csv_content(csv) # rubocop:disable Metrics/MethodLength
    csv << ['Report Name', 'Date Range', 'Category', 'Person'].concat(allowed_categories.map(&:humanize))

    project_report.last_body.each do |key, work_times|
      next if key == 'ignored'

      report_name = project_report.name
      date_range = [project_report.starts_at, project_report.ends_at].map { |n| n.strftime('%Y/%m/%d') }.join('-')
      category = translate_role(key)

      work_times.group_by { |wt| [wt['owner'], wt['user_id']] }.map do |(owner, _user_id), wts|
        wts.map do |wt|
          csv << [report_name, date_range, category, owner].concat(allowed_categories.map { |k| send("format_#{k}", wt[k]) })
        end
      end
    end
  end

  def format_task(task)
    return task unless task&.match?(URI::DEFAULT_PARSER.make_regexp)

    task_name = URI.parse(task).path.split('/').last
    "=HYPERLINK(\"#{task}\", \"#{task_name}\")"
  rescue URI::InvalidURIError
    task
  end

  def format_description(description)
    description
  end

  def format_tag(tag)
    tag.humanize
  end

  def format_duration(duration)
    Time.at(duration).utc.strftime('%H:%M')
  end

  def format_cost(cost)
    return nil unless show_cost? # nil column will not be rendered
    return format(FORMAT_STRING, cost.round(2)) if project_report.currency.blank?

    "#{project_report.currency} #{format(FORMAT_STRING, cost.round(2))}"
  end

  CATEGORY_HEADERS = %w[tag task description duration cost].freeze
  def allowed_categories
    @allowed_categories ||= CATEGORY_HEADERS.select { |header| send("show_#{header}?") }
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

  def show_tag?
    true
  end

  def show_description?
    true
  end

  def translate_role(role)
    I18n.t(role, scope: 'apps.project_report_roles')
  end
end
