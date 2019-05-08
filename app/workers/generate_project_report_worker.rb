# frozen_string_literal: true

require 'fileutils'

# :nocov:
class GenerateProjectReportWorker
  include Sidekiq::Worker

  def perform(id)
    project_report = ProjectReport.find(id)
    file = File.new(file_path(project_report), 'w')
    file.close
    ProjectReportGenerator.new(project_report: project_report).call(file)
    project_report.update!(file_path: file.path)
  end

  private

  def file_path(project_report)
    dir = Rails.root.join('system', 'uploads', 'reports', project_report.project_id.to_s)
    FileUtils.mkdir_p(dir)
    File.join(dir, "#{project_report.id}.pdf")
  end
end
# :nocov:
