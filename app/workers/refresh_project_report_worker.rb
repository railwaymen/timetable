# frozen_string_literal: true

class RefreshProjectReportWorker
  include Sidekiq::Worker

  def perform(project_report_id, user_id)
    ProjectReportRefresher.new(project_report_id: project_report_id, user_id: user_id).call
  end
end
