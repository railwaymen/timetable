# frozen_string_literal: true

require 'fileutils'

class GenerateProjectReportWorker
  include Sidekiq::Worker

  def perform(id)
    ProjectReport.find(id).tap do |project_report|
      generate_pdf(project_report)
      generate_csv(project_report)
    end
  end

  private

  def generate_pdf(project_report)
    file = File.new(file_path(project_report: project_report, format: '.pdf'), 'w').tap(&:close)
    ProjectReportPdfGenerator.new(project_report).call(file)
    project_report.update!(pdf_file_path: file.path)
  end

  def generate_csv(project_report)
    file = File.new(file_path(project_report: project_report, format: '.csv'), 'w').tap(&:close)
    csv_data = ProjectReportCsvGenerator.new(project_report).call
    File.write(file, csv_data)
    project_report.update!(csv_file_path: file.path)
  end

  def file_path(project_report:, format: '.pdf')
    dir = Rails.env.production? ? Rails.root.join('..', '..', 'shared', 'system', 'uploads', 'reports', project_report.project_id.to_s) : Rails.root.join('system', 'uploads', 'reports', project_report.project_id.to_s)
    FileUtils.mkdir_p(dir)
    file_name = [project_report.project.name, project_report.name, project_report.id.to_s]
                .map { |str| str.parameterize(separator: '_', preserve_case: true) }
                .join('-')
                .concat(format)
    File.join(dir, file_name)
  end
end
