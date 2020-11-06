# frozen_string_literal: true

module Api
  class TagsController < Api::BaseController
    def index
      authorize Tag
      action = params[:filter].presence_in(visiblity_list) || 'active'
      @tags = Tag.filter_by(action.to_sym)
                 .left_joins(:project)
                 .order(created_at: :desc).page(params[:page]).per(params[:per_page] || 24)
      @tags.where!('tags.name ILIKE ?', "%#{params[:query]}%") if params[:query].present?
      @tags.where!(project_id: params[:project_id]) if params[:project_id].present?
      respond_with @tags
    end

    def create
      authorize Tag
      @tag = Tag.new(name: tag_params[:name], project_id: tag_params[:project_id])
      @tag.project_id = nil if tag_params[:global]
      @tag.save
      respond_with :api, @tag
    end

    def show
      authorize Tag
      respond_with tag
    end

    def update
      authorize tag
      tag.assign_attributes(name: tag_params[:name], project_id: tag_params[:project_id])
      tag.project_id = nil if tag_params[:global]
      tag.save
      tag_params[:active] ? tag.undiscard : tag.discard
      respond_with tag
    end

    private

    def tag
      @tag ||= Tag.find(params[:id])
    end

    def visiblity_list
      %w[active inactive all]
    end

    def tag_params
      params.require(:tag).permit(:id, :name, :project_id, :active, :global)
    end
  end
end
