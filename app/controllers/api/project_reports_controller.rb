# frozen_string_literal: true

module Api
  class ProjectReportsController < BaseController
    respond_to :json
    before_action :load_project

    def create
      @report = @project.project_reports.new(
        initial_body: {},
        last_body: {},
        starts_at: params[:starts_at],
        ends_at: params[:ends_at],
        currency: params[:currency],
        name: params[:name]
      )
      authorize @report
      @report = ProjectReportCreator.new.call(@report, params[:project_report_roles])
    end

    def index
      @reports = @project.project_reports
      authorize @reports
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

    def generate
      @report = @project.project_reports.find(params[:id])
      authorize @report
      @report.update!(state: :done)
      # TODO: Call worker
      respond_with @report
    end

    # rubocop:disable MethodLength
    def roles
      authorize :project_report
      users = @project.users_participating(params[:starts_at]..params[:ends_at])
      last_report = @project.project_reports.done.order(id: :desc).first
      @currency = last_report&.currency || ''
      @user_roles = if last_report
                      users
                        .left_joins(:project_report_roles)
                        .where('project_report_roles.id IS NULL OR project_report_roles.project_report_id=?', last_report.id) # either role from report or no role
                        .distinct.select('users.*, project_report_roles.role, COALESCE(project_report_roles.hourly_wage, 0) AS hourly_wage')
                    else
                      users.distinct.select('users.*, NULL AS role, 0 AS hourly_wage')
                    end
    end
    # rubocop:enable MethodLength

    private

    def load_project
      @project = Project.find(params[:project_id])
    end
  end
end
