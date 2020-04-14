# frozen_string_literal: true

module Api
  class CombinedReportsController < Api::BaseController
    respond_to :json

    def create
      project = Project.find(params[:project_id])
      project.combined_reports.create!(combined_reports_prams)
    end

    private

    def combined_reports_prams
    end
  end
end
