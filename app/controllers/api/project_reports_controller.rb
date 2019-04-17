# frozen_string_literal: true

module Api
  class ProjectReportsController < BaseController
    respond_to :json
    before_action :load_project

    def create
      @report = @project.project_reports.new(
        initial_body: {},
        last_body: {},
        range_start: params[:range_start],
        range_end: params[:range_end]
      )
      authorize @report
      @report = ProjectReportCreator.new.call(@report, params[:project_report_roles])
    end

    def show
      @report = @project.project_reports.find(params[:id])
      authorize @report
    end

    def edit
      @report = @project.project_reports.find(params[:id])
      authorize @report
    end

    def update
      @report = @project.project_reports.find(params[:id])
      authorize @report
      last_body = params.require(:project_report)[:last_body].permit!
      @report.update(last_body: last_body)
      respond_with @report
    end

    def roles
      authorize :project_report
      users = @project.users_participating(params[:range_start]..params[:range_end])
      @user_roles = if (last_report = @project.project_reports.done.order(id: :desc).first)
                      users
                        .left_joins(:project_report_roles)
                        .where('project_report_roles.id IS NULL OR project_report_roles.project_report_id=?', last_report.id) # either role from report or no role
                        .distinct.select('users.*, project_report_roles.role')
                    else
                      users.distinct.select('users.*, NULL AS role')
                    end
    end

    private

    def load_project
      @project = Project.find(params[:project_id])
    end
  end
end
