# frozen_string_literal: true

module Api
  class ProjectResourceAssignmentsController < Api::BaseController
    before_action :authenticate_admin_or_manager_or_leader!
    respond_to :json

    def index
      @events = ProjectResourceAssignment.all.order(:starts_at)
      respond_with @events
    end

    def create
      @resource = ProjectResource.find_by(rid: events_params[:resource_rid])
      @user = @resource.user
      @event = ProjectResourceAssignment.create(events_params.merge(user_id: @user.id, resource_id: @resource.id))
      respond_with @event
    end

    def update
      update_params = events_params
      @event = ProjectResourceAssignment.find(params[:id])
      if events_params[:resource_rid].present? && @event.resource_rid != events_params[:resource_rid]
        resource = ProjectResource.find_by(rid: events_params[:resource_rid])
        user_id = resource.user.id
        update_params = update_params.merge(user_id: user_id, resource_id: resource.id)
      end
      @event.update(update_params)
      respond_with @event
    end

    def destroy
      @event = ProjectResourceAssignment.find(params[:id])
      @event.destroy
      respond_with @event
    end

    def find_by_slot
      resource_ids = 
        if params[:selected_users].present?
          selected_users = params[:selected_users].split(',')
          ProjectResource.where('user_id IN (?) OR group_only = ?', selected_users, true).pluck(:id)
        else
          ProjectResource.where('group_only = ? AND parent_rid IS NULL', false).pluck(:id)
        end
      if params[:expanded_resources].present?
        resources = params[:expanded_resources].split(',')
        ProjectResource.where(rid: resources).each { |r| resource_ids.push(r.child_resources.where(group_only: false).pluck(:id)) }
      end
      @events = ProjectResourceAssignment.where(project_resource_id: resource_ids.flatten).order(:starts_at)
      if params[:selected_projects].present?
        projects = params[:selected_projects].split(',')
        @events = @events.where(project_id: projects)
      end
      respond_with @events
    end

    private

    def events_params
      params.fetch(:event).permit(:project_id, :resource_rid, :starts_at, :ends_at, :title, :color)
    end
  end
end
