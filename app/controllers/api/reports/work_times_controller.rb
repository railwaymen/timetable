module Api
  module Reports
    class WorkTimesController < AuthenticatedController
      before_action :authenticate_admin_or_manager_or_leader!
      respond_to :json

      def index
        from = Time.zone.parse(params[:from])
        to   = Time.zone.parse(params[:to])

        @report = ReportProjectRecordQuery.new(from: from, to: to, project_ids: projects_accessibility).results
      end

      def by_users
        from = Time.zone.parse params[:from]
        to   = Time.zone.parse params[:to]

        @report = ReportUserRecordQuery.new(from: from, to: to, project_ids: projects_accessibility).results
      end

      private

      def projects_accessibility
        current_user.projects.pluck(:id) unless current_user.admin? || current_user.manager?
      end
    end
  end
end
