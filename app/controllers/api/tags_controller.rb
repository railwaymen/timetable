# frozen_string_literal: true

module Api
  class TagsController < Api::BaseController
    before_action :authenticate_admin_or_manager!

    def index
      action = params[:filter].presence_in(visiblity_list) || 'active'
      @tags = Tag.filter_by(action.to_sym)
                 .left_joins(:project)
                 .order(created_at: :desc)
      respond_with @tags
    end

    def create
      @tag = Tag.new(name: tags_params[:name], project_id: project.id)
      @tag.project_id = nil if tags_params[:global]
      @tag.save
      respond_with :api, @tag
    end

    def show
      respond_with tag
    end

    def update
      authorize tag
      tag.assign_attributes(name: tags_params[:name], project_id: project.id)
      tag.project_id = nil if tags_params[:global]
      tag.save
      tags_params[:active] ? tag.undiscard : tag.discard
      respond_with tag
    end

    private

    def tag
      @tag ||= Tag.find(params[:id])
    end

    def project
      @project ||= Project.find_by(id: tags_params[:project_id])
    end

    def visiblity_list
      %w[active inactive all]
    end

    def tags_params
      params.require(:tag).permit(:id, :name, :project_id, :active, :global)
    end
  end
end
