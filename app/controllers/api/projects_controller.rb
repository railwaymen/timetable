# frozen_string_literal: true

module Api
  class ProjectsController < Api::BaseController
    wrap_parameters :project
    before_action :authenticate_admin_or_manager_or_leader!, only: %i[show create update]

    def index
      range = params[:range].presence_in(valid_days) || 30
      @project_stats = ProjectRateQuery.new(starts_at: range.to_i.days.ago, ends_at: Time.zone.now.end_of_day).results
    end

    def list
      action = params[:display].presence_in(visiblity_list) || 'active'
      @projects = projects_scope.filter_by action.to_sym
    end

    def simple
      @projects = Project.order(:internal, :name).where.not(name: %w[Vacation ZKS])
    end

    def tags
      @tags = WorkTime.tags
      respond_with @tags
    end

    def show
      @project = project_scope
    end

    # rubocop:disable Metrics/MethodLength
    def work_times
      @project = project_scope
      from, to = resolve_from_to_dates
      report_params = { from: from, to: to, project_ids: params[:id], sort: params[:sort] }
      work_times_query = @project.work_times.kept.where(starts_at: from..to)

      if params[:user_id]
        report_params[:user_ids] = [params[:user_id]]
        work_times_query = work_times_query.joins(:user).where('users.id = ?', params[:user_id])
      end

      @report = ReportProjectRecordQuery.new(**report_params).results
      @tag_report = ReportProjectTagRecordQuery.new(**report_params).results

      @work_times = WorkTimePolicy::Scope.new(current_user, work_times_query)
                                         .resolve
                                         .includes(:user)
    end
    # rubocop:enable Metrics/MethodLength

    def create
      @project = Project.new
      UpdateProjectForm.new(permitted_attributes(@project).merge(project: @project)).save
      respond_with @project
    end

    def update
      @project = project_scope
      UpdateProjectForm.new(permitted_attributes(@project).merge(current_user: current_user, project: @project)).save
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
  end
end
