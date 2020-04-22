# frozen_string_literal: true

require 'fileutils'

class GenerateCombinedReportWorker
  include Sidekiq::Worker

  def perform(id)
    combined_report = CombinedReport.find(id)
    file = File.new(file_path(combined_report), 'w').tap(&:close)
    CombinedReportGenerator.new(combined_report).call(file)
    combined_report.update!(file_path: file.path)
  end

  private

  def file_path(combined_report)
    dir = Rails.root.join('system', 'uploads', 'combined_reports', combined_report.project_id.to_s)
    FileUtils.mkdir_p(dir)
    file_name = [combined_report.project.name, combined_report.name, combined_report.id.to_s]
                .map { |str| str.parameterize(separator: '_', preserve_case: true) }
                .join('-')
                .concat('.pdf')
    File.join(dir, file_name)
  end
end
