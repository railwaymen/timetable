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
  end
end
