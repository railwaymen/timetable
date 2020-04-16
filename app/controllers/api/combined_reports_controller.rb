# frozen_string_literal: true

module Api
  class CombinedReportsController < Api::BaseController
    before_action :load_project, only: %i[index create]
    respond_to :json

    def index
      @combined_reports = policy_scope(CombinedReport).kept.where(project_id: @project.id)
    end

    def create
      @combined_report = @project.combined_reports.build(combined_reports_prams)
      authorize @combined_report

      @combined_report.save!

      params[:combined_report][:report_ids].each do |id|
        @combined_report.combined_reports_project_reports.create!(project_report_id: id)
      end
    end

    def show
      @combined_report = CombinedReport.find(params[:id])
      authorize @combined_report
    end

    def destroy
      @combined_report = CombinedReport.find(params[:id])
      authorize @combined_report

      @combined_report.discard
    end

    private

    def combined_reports_prams
      params.require(:combined_report).permit(%i[name])
    end

    def load_project
      @project = Project.find(params[:project_id])
    end
  end
end
