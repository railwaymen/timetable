# frozen_string_literal: true

module Api
  class MilestonesController < Api::BaseController
    def index
      @milestones = project.milestones.kept.order(:position)
      authorize @milestones
      respond_with @milestones
    end

    def show
      @milestone = project.milestones.kept.find(params[:id])
      authorize @milestone
      respond_with @milestone
    end

    def create
      @milestone = project.milestones.create(milestone_params.merge(position: next_position))
      authorize @milestone
      respond_with @milestone
    end

    def update
      @milestone = project.milestones.kept.find(params[:id])
      authorize @milestone
      UpdateMilestoneForm.new(milestone_params.merge(milestone: @milestone)).save
      respond_with @milestone
    end

    def import
      ImportJiraMilestonesWorker.perform_async(project.id, current_user.id)
    end

    def import_status
      render json: { complete: !CheckJobExist.new(ImportJiraMilestonesWorker).call }
    end

    private

    def next_position
      (project.milestones.maximum(:position) || 0) + 1
    end

    def milestone_params
      params.permit(:name, :starts_on, :ends_on, :note, :dev_estimate, :qa_estimate, :ux_estimate, :pm_estimate, :other_estimate, :estimate_change_note)
    end

    def project
      @project ||= Project.find(params[:project_id])
    end

    def recounting
      AccountingPeriodsManager.new(user_id: params[:user_id]).job_exist?
    end
  end
end
