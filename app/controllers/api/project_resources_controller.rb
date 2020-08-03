# frozen_string_literal: true

module Api
  class ProjectResourcesController < Api::BaseController
    before_action :authorize_project_resource
    after_action :verify_authorized

    def index
      if params[:selected_users].present?
        selected_users = params[:selected_users].split(',')
        @project_resources = ProjectResource.kept.where('user_id IN (?) OR group_only = ?', selected_users, true).order(:position)
      else
        @project_resources = ProjectResource.kept.order(:position)
      end
      respond_with @project_resources
    end

    def activity
      @versions = PaperTrail::Version.where(item_type: [ProjectResource.to_s, ProjectResourceAssignment.to_s]).order(created_at: :desc).includes(:item).limit(10)
      respond_with @versions
    end

    def create
      @project_resource = ResourcesService.new.call(project_resource_params)
      respond_with @project_resource
    end

    def destroy
      @project_resource = ProjectResource.kept.find_by(rid: params[:id])
      @project_resource.discard!
      respond_with @project_resource
    end

    private

    def authorize_project_resource
      authorize ProjectResource
    end

    def project_resource_params
      params.permit(:name, :group_only, :parent_rid, :user_id)
    end
  end
end
