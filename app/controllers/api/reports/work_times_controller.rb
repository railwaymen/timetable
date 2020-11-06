# frozen_string_literal: true

module Api
  module Reports
    class WorkTimesController < Api::BaseController
      before_action :authenticate_admin_or_manager_or_leader!, only: :index

      def index
        from = Time.zone.parse(params[:from])
        to   = Time.zone.parse(params[:to])

        @report = ReportProjectRecordQuery.new(from: from, to: to, tag_id: params[:tag_id], project_ids: projects_accessibility, sort: params[:sort]).results
      end

      def by_users
        from = Time.zone.parse params[:from]
        to   = Time.zone.parse params[:to]

        @report = ReportUserRecordQuery.new(from: from, to: to, tag_id: params[:tag_id], user: current_user, action: params[:list] || :self).results
      end

      private

      def projects_accessibility
        current_user.projects.pluck(:id) unless current_user.admin? || current_user.manager?
      end
    end
  end
end
