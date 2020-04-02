# frozen_string_literal: true

module Api
  class ProjectResourceAssignmentsController < Api::BaseController
    before_action :authorize_project_resource_assignment
    after_action :verify_authorized

    def index
      @project_resource_assignments = ProjectResourceAssignment.kept.order(:starts_at)
      respond_with @project_resource_assignments
    end

    def create
      @resource = ProjectResource.find_by(rid: events_params[:resource_rid])
      @user = @resource.user
      @project_resource_assignment = ProjectResourceAssignment.create(events_params.merge(user_id: @user.id, project_resource_id: @resource.id))
      respond_with @project_resource_assignment
    end

    def update
      update_params = events_params
      @project_resource_assignment = ProjectResourceAssignment.find(params[:id])
      if events_params[:resource_rid].present? && @project_resource_assignment.resource_rid != events_params[:resource_rid]
        resource = ProjectResource.find_by(rid: events_params[:resource_rid])
        user_id = resource.user.id
        update_params = update_params.merge(user_id: user_id, project_resource_id: resource.id)
      end
      @project_resource_assignment.update(update_params)
      respond_with @project_resource_assignment
    end

    def destroy
      @project_resource_assignment = ProjectResourceAssignment.find(params[:id])
      @project_resource_assignment.discard!
      respond_with @project_resource_assignment
    end

    def find_by_slot # rubocop:disable Metrics/MethodLength
      resource_ids =
        if params[:selected_users].present?
          selected_users = params[:selected_users].split(',')
          ProjectResource.kept.where('user_id IN (?) OR group_only = ?', selected_users, true).pluck(:id)
        else
          ProjectResource.kept.where('group_only = ? AND parent_rid IS NULL', false).pluck(:id)
        end
      ProjectResource.kept.where(parent_rid: nil).each { |r| resource_ids.push(r.child_resources.where(group_only: false).pluck(:id)) }
      @project_resource_assignments = ProjectResourceAssignment.kept.where(project_resource_id: resource_ids.flatten).order(:starts_at)
      @project_resource_assignments.where!(project_id: params[:selected_projects].split(',')) if params[:selected_projects].present?
      respond_with @project_resource_assignments
    end

    private

    def authorize_project_resource_assignment
      authorize ProjectResourceAssignment
    end

    def events_params
      params.permit(:project_id, :resource_rid, :starts_at, :ends_at, :title, :color)
    end
  end
end
