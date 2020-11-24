# frozen_string_literal: true

module Api
  class MilestonesController < Api::BaseController
    def index
      @milestones = MilestonesQuery.new(project: project, params: params).results

      authorize Milestone
      respond_with @milestones
    end

    def show
      @milestone = project.milestones.kept.find(params[:id])
      authorize @milestone
      respond_with @milestone
    end

    def create
      @milestone = project.milestones.create(milestone_params.except(:active))
      authorize @milestone
      respond_with @milestone
    end

    def update
      @milestone = project.milestones.kept.find(params[:id])
      authorize @milestone
      UpdateMilestoneForm.new(milestone_params.merge(milestone: @milestone)).save
      respond_with @milestone
    end

    def work_times
      authorize Milestone
      milestone = project.milestones.find_by(id: params[:milestone_id])

      from_date = params[:from].presence || milestone.starts_on
      to_date = params[:to].presence || milestone.ends_on

      work_times_query = WorkTimes::MilestoneWorkTimesQuery.new(milestone, project, from_date, to_date).perform

      @work_times = WorkTimePolicy::Scope.new(current_user, work_times_query)
                                         .resolve
                                         .includes(:user)
      respond_with @work_times
    end

    def import
      authorize Milestone
      ImportJiraMilestonesWorker.perform_async(project.id, current_user.id)
    end

    def import_status
      authorize Milestone
      render json: { complete: !CheckJobExist.new(ImportJiraMilestonesWorker).call }
    end

    private

    def milestone_params
      params.permit(:name, :starts_on, :ends_on, :note, :closed, :visible_on_reports, :active,
                    :dev_estimate, :qa_estimate, :ux_estimate, :pm_estimate, :other_estimate, :estimate_change_note)
    end

    def project
      @project ||= Project.find(params[:project_id])
    end
  end
end
