# frozen_string_literal: true

module Api
  class ProjectResourceAssignmentsController < Api::BaseController
    before_action :authorize_project_resource_assignment
    after_action :verify_authorized

    def index
      resource_ids = if params[:selected_users].present?
                       ProjectResource.kept.where(user_id: params[:selected_users].split(',')).pluck(:id)
                     else
                       ProjectResource.kept.pluck(:id)
                     end

      @project_resource_assignments = ProjectResourceAssignment.kept.where(project_resource_id: resource_ids.flatten).order(:starts_at)
      @project_resource_assignments.where!(project_id: params[:selected_projects].split(',')) if params[:selected_projects].present?
      respond_with @project_resource_assignments
    end

    def create
      @resource = ProjectResource.kept.find_by(rid: events_params[:resource_rid])
      @user = @resource.user
      @project_resource_assignment = ProjectResourceAssignment.create(events_params.merge(user_id: @user.id, project_resource_id: @resource.id))
      respond_with @project_resource_assignment
    end

    def update
      update_params = events_params
      @project_resource_assignment = ProjectResourceAssignment.kept.find(params[:id])
      if events_params[:resource_rid].present? && @project_resource_assignment.resource_rid != events_params[:resource_rid]
        resource = ProjectResource.kept.find_by(rid: events_params[:resource_rid])
        user_id = resource.user.id
        update_params = update_params.merge(user_id: user_id, project_resource_id: resource.id)
      end
      @project_resource_assignment.update(update_params)
      respond_with @project_resource_assignment
    end

    def destroy
      @project_resource_assignment = ProjectResourceAssignment.kept.find(params[:id])
      @project_resource_assignment.discard!
      respond_with @project_resource_assignment
    end

    private

    def authorize_project_resource_assignment
      authorize ProjectResourceAssignment
    end

    def events_params
      params.permit(:project_id, :resource_rid, :starts_at, :ends_at, :title, :color, :note)
    end
  end
end
