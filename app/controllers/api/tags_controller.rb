# frozen_string_literal: true

module Api
  class TagsController < Api::BaseController
    before_action :authenticate_admin_or_manager!

    def index
      action = params[:filter].presence_in(visiblity_list) || 'active'
      @tags = Tag.where.not(project_id: nil)
                 .filter_by(action.to_sym)
                 .includes(:project)
                 .order('projects.id')
      respond_with @tags
    end

    def create
      @tag = Tag.create(name: tags_params[:name], project_id: project.id)
      respond_with :api, @tag
    end

    def show
      respond_with tag
    end

    def update
      authorize tag
      tag.update(name: tags_params[:name], project_id: project.id)
      tags_params[:active] ? tag.undiscard : tag.discard
      respond_with tag
    end

    private

    def tag
      @tag ||= Tag.find(params[:id])
    end

    def project
      @project ||= Project.find_by(name: tags_params[:project_name])
    end

    def visiblity_list
      %w[active inactive all]
    end

    def tags_params
      params.require(:tag).permit(:id, :name, :project_name, :active)
    end
  end
end
