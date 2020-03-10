# frozen_string_literal: true

module Api
  class ResourcesController < Api::BaseController
    before_action :authenticate_admin_or_manager_or_leader!
    respond_to :json

    def index
      if params[:selected_users].present?
        selected_users = params[:selected_users].split(',')
        @resources = Resource.where('user_id IN (?) OR group_only = ?', selected_users, true)
      else
        @resources = Resource.all
      end
      respond_with @resources
    end

    def create
      @resource = ResourcesService.new.call(resource_params)
      respond_with @resource
    end

    def destroy
      @resource = Resource.find_by(rid: params[:id])
      @resource.destroy
      respond_with @resource
    end

    private

    def resource_params
      params.fetch(:resource).permit(:name, :group_only, :parent_rid, :user_id)
    end

    def generate_rid_and_parent_id(name, parent_id)
      if parent_id.present?
        parent_resource = Resource.find(parent_id)
        rid = "#{parent_resource.rid}-#{name}"
        parent_rid = parent_resource.rid
      else
        rid = name
        parent_rid = nil
      end
      [rid, parent_rid]
    end
  end
end
