# frozen_string_literal: true

module Api
  class ProjectsController < Api::BaseController
    respond_to :json
    wrap_parameters :project
    before_action :authenticate_admin_or_manager_or_leader!, only: %i[show create update]

    def index
      range = params[:range].presence_in(valid_days) || 30
      @projects = ProjectRate.stats(starts_at: range.to_i.days)

      respond_with @projects
    end

    def list
      action = params[:display].presence_in(visiblity_list) || 'active'
      @projects = projects_scope.filter_by action.to_sym
    end

    def simple
      @projects = Project.where("name != 'Vacation' AND name != 'ZKS'").order(:internal, :name)
      @tags = WorkTime.tags
      respond_with @projects
    end

    def show
      @project = project_scope
    end

    # rubocop:disable Metrics/MethodLength
    def work_times
      @project = project_scope
      from, to = resolve_from_to_dates
      report_params = { from: from, to: to, project_ids: params[:id], sort: params[:sort] }
      work_times_query = @project.work_times.active.where(starts_at: from..to)

      if params[:user_id]
        report_params[:user_ids] = [params[:user_id]]
        work_times_query = work_times_query.joins(:user).where('users.id = ?', params[:user_id])
      end

      @report = ReportProjectRecordQuery.new(report_params).results
      @tag_report = ReportProjectTagRecordQuery.new(report_params).results

      @work_times = WorkTimePolicy::Scope.new(current_user, work_times_query)
                                         .resolve
                                         .includes(:user)
    end
    # rubocop:enable Metrics/MethodLength

    def external_auth
      @project = project_scope
      @external_auth = @project.external_auth
    end

    def create
      @project = Project.create(project_params)
      respond_with :api, @project
    end

    def update
      @project = project_scope
      @project.update(project_params)
      respond_with @project
    end

    private

    def visiblity_list
      %w[all inactive active]
    end

    def valid_days
      %w[30 60 90]
    end

    def resolve_from_to_dates
      time = Time.zone.now
      if params[:from].present? && params[:to].present?
        [
          Time.zone.parse(params[:from]),
          Time.zone.parse(params[:to])
        ]
      else
        [time.beginning_of_week, time.end_of_week]
      end
    end

    def project_scope
      @project_scope ||= begin
        if current_user.admin? || current_user.manager?
          Project.find(params[:id])
        else
          current_user.projects.find(params[:id])
        end
      end
    end

    def projects_scope
      @projects_scope ||= Project.includes(:leader).order(name: :asc)
    end

    def project_params
      current_user.admin? || current_user.manager? ? admin_project_params : leader_project_params
    end

    def leader_project_params
      params.require(:project).permit(:color, :work_times_allows_task)
    end

    def admin_project_params
      params.fetch(:project)
            .permit(:name, :color, :leader_id, :active, :work_times_allows_task)
    end
  end
end
