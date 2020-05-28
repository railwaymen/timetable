# frozen_string_literal: true

module Api
  class MilestoneEstimatesController < Api::BaseController
    def index
      @estimates = milestone.estimates.order(created_at: :desc)
      authorize @estimates
      respond_with @estimates
    end

    private

    def milestone
      @milestone ||= Milestone.find(params[:milestone_id])
    end

    def project
      @project ||= Project.find(params[:project_id])
    end

    def recounting
      AccountingPeriodsManager.new(user_id: params[:user_id]).job_exist?
    end
  end
end
