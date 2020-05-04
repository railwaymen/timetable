# frozen_string_literal: true

module Api
  class CombinedReportsController < Api::BaseController
    before_action :load_project, only: %i[index create]
    respond_to :json

    def index
      @combined_reports = policy_scope(CombinedReport).kept.where(project_id: @project.id).order(created_at: :desc)
    end

    def create
      @combined_report = @project.combined_reports.build(combined_report_prams)
      authorize @combined_report

      combined_report_form = CombinedReportForm.new(@combined_report, params[:combined_report][:report_ids])
      combined_report_form.save
      respond_with combined_report_form
    end

    def show
      @combined_report = CombinedReport.kept.find(params[:id])
      authorize @combined_report

      select_columns = 'project_reports.*, count(combined_reports_project_reports.id) AS combined_reports_count'
      @project_reports = @combined_report.project_reports
                                         .select(select_columns)
                                         .left_outer_joins(:kept_combined_reports_project_reports)
                                         .group('project_reports.id')
    end

    def destroy
      @combined_report = CombinedReport.kept.find(params[:id])
      authorize @combined_report

      @combined_report.discard
    end

    def synchronize
      combined_report = CombinedReport.kept.find(params[:id])
      authorize combined_report

      synchronized = combined_report.project_reports.map { |report| ReportsComparator.new.call(report) }.all?
      render json: { synchronized: synchronized }
    end

    def file
      combined_report = CombinedReport.kept.find(params[:id])
      authorize combined_report

      send_file combined_report.file_path
    end

    private

    def combined_report_prams
      params.require(:combined_report).permit(%i[name])
    end

    def load_project
      @project = Project.find(params[:project_id])
    end
  end
end
