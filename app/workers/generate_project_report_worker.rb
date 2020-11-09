# frozen_string_literal: true

require 'fileutils'

class GenerateProjectReportWorker
  include Sidekiq::Worker

  def perform(id)
    project_report = ProjectReport.find(id)
    file = File.new(file_path(project_report), 'w').tap(&:close)
    ProjectReportGenerator.new(project_report: project_report).call(file)
    project_report.update!(file_path: file.path)
  end

  private

  def file_path(project_report)
    dir = Rails.env.production? ? Rails.root.join('..', '..', 'shared', 'system', 'uploads', 'reports', project_report.project_id.to_s) : Rails.root.join('system', 'uploads', 'reports', project_report.project_id.to_s)
    FileUtils.mkdir_p(dir)
    file_name = [project_report.project.name, project_report.name, project_report.id.to_s]
                .map { |str| str.parameterize(separator: '_', preserve_case: true) }
                .join('-')
                .concat('.pdf')
    File.join(dir, file_name)
  end
end
