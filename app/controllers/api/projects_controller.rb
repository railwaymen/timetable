# frozen_string_literal: true

module Api
  class ProjectsController < Api::BaseController
    wrap_parameters :project
    before_action :authenticate_admin_or_manager_or_leader!, only: %i[show create update]

    def index
      @project_stats = ProjectRateQuery.new(project_query_params).results
    end

    def list
      @project_stats = ProjectRateQuery.new(project_query_params).results
    end

    def simple
      @projects = Project.order(:internal, :name)
    end

    def current_milestones
      @milestones = Milestones::CurrentQuery.new(project_ids: params[:projects]).results
      respond_with @milestones
    end

    def with_tags
      @global_tags = Tag.where(project_id: nil)
      @projects = Project.kept.order(:internal, :name).includes(:tags).where.not(name: 'Vacation')
      @projects = @projects.where.not(name: 'ZKS') unless current_user.admin?
    end

    def tags
      @tags = { 'dev': 'dev', 'im': 'im', 'cc': 'cc', 'res': 'res' }
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

    def project_query_params
      range = params[:range].presence_in(%w[30 60 90])
      visibility = params[:display].presence_in(%w[all inactive active]) || 'active'
      type = params[:type].presence_in(%w[commercial internal all]) || 'all'
      sort = params[:sort].presence_in(%w[hours alphabetical]) || 'hours'
      base_params = { visibility: visibility, type: type, sort: sort }
      return base_params.merge(starts_at: nil, ends_at: nil) if range.nil?
      return base_params.merge(starts_at: range.to_i.days.ago, ends_at: Time.zone.now.end_of_day) if range.present?
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
  end
end
