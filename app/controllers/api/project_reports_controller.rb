# frozen_string_literal: true

module Api
  class ProjectReportsController < BaseController
    before_action :load_project

    def create
      @report = @project.project_reports.new(project_report_prams.merge(initial_body: {}, last_body: {}))
      authorize @report

      # TODO: Refactor
      if @report.valid? || @report.errors[:name].empty?
        @report = ProjectReportCreator.new.call(@report, params[:project_report_roles])
      else
        respond_with @report
      end
    end

    def index
      select_columns = 'project_reports.*, count(combined_reports_project_reports.id) AS combined_reports_count'
      @reports = @project.project_reports
                         .kept
                         .select(select_columns)
                         .left_outer_joins(:kept_combined_reports_project_reports)
                         .group('project_reports.id')
                         .order(id: :desc)
      @reports.where!('starts_at < ? AND ? < ends_at', params[:ends_at], params[:starts_at]) if params[:starts_at].present? && params[:ends_at].present?
      authorize @reports
    end

    def show
      @report = @project.project_reports.kept.find(params[:id])
      authorize @report
    end

    def edit
      @report = @project.project_reports.kept.find(params[:id])
      authorize @report
    end

    def update
      @report = @project.project_reports.kept.find(params[:id])
      authorize @report
      last_body = params.require(:project_report)[:last_body].permit!
      @report.update(last_body: last_body)
      respond_with @report
    end

    def synchronize
      report = @project.project_reports.kept.find(params[:id])
      authorize report
      compared_reports = ReportsComparator.new.call(report)
      render json: { synchronized: compared_reports }
    end

    def destroy
      @report = @project.project_reports.kept.find(params[:id])
      authorize @report
      @report.discarded_at = Time.current
      @report.save
      respond_with @report
    end

    def generate
      @report = @project.project_reports.kept.find(params[:id])
      authorize @report
      @report.update!(state: :done)
      GenerateProjectReportWorker.perform_async(@report.id)
      respond_with @report
    end

    def file
      @report = @project.project_reports.kept.find(params[:id])
      authorize @report
      return head(:no_content) if @report.file_path.blank?

      send_file @report.file_path
    end

    def roles
      authorize :project_report
      users = @project.users_participating(params[:starts_at]..params[:ends_at])
      last_report = @project.project_reports.kept.done.order(id: :desc).first
      @currency = last_report&.currency || ''
      project_reports = @project.project_reports.kept.select('project_reports.id').to_sql
      @user_roles = users.joins("LEFT OUTER JOIN project_report_roles prr1 ON prr1.user_id=users.id AND prr1.project_report_id IN (#{project_reports})") # join project_report_roles from given project
                         .joins("LEFT OUTER JOIN project_report_roles prr2 ON prr2.user_id=users.id AND prr1.id < prr2.id AND prr2.project_report_id IN (#{project_reports})")
                         .where('prr2.id IS NULL') # select role with highest id
                         .distinct.select("users.*, prr1.role, COALESCE(prr1.description, '') AS description, COALESCE(prr1.hourly_wage, 0) AS hourly_wage")
    end

    private

    def load_project
      @project = Project.find(params[:project_id])
    end

    def project_report_prams
      params.permit(%i[starts_at ends_at currency name])
    end
  end
end
