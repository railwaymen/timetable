# frozen_string_literal: true

module Api
  class CombinedReportsController < Api::BaseController
    respond_to :json

    def create
      project = Project.find(params[:project_id])
      @combined_report = project.combined_reports.build(combined_reports_prams)
      authorize @combined_report

      @combined_report.save!

      params[:combined_report][:report_ids].each do |id|
        @combined_report.combined_reports_project_reports.create!(project_report_id: id)
      end
    end

    private

    def combined_reports_prams
      params.require(:combined_report).permit(%i[name])
    end
  end
end
