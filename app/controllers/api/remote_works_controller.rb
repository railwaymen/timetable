# frozen_string_literal: true

module Api
  class RemoteWorksController < Api::BaseController
    respond_to :json

    def index
      @remote_works = RemoteWork.kept.order(starts_at: :desc).page(params[:page]).per(params[:per_page] || 24)
      @remote_works.where!(user_id: params[:user_id]) if params[:user_id].present?
      @remote_works = policy_scope(@remote_works)
      respond_with @remote_works
    end

    def create
      @remote_work = current_user.remote_works.build
      @remote_work.assign_attributes(permitted_attributes(@remote_work).merge(creator_id: current_user.id))
      @remote_work_form = RemoteWorkForm.new(@remote_work)
      authorize @remote_work_form.remote_work

      @remote_work_form.save(save_params)
      respond_with @remote_work_form
    end

    def update
      @remote_work = RemoteWork.kept.find(params[:id])
      authorize @remote_work

      @remote_work.assign_attributes(permitted_attributes(@remote_work))
      @remote_work.updated_by_admin = true if @remote_work.user_id != current_user.id
      @remote_work.save(save_params)

      respond_with @remote_work
    end

    def destroy
      @remote_work = RemoteWork.kept.find(params[:id])
      authorize @remote_work

      @remote_work.updated_by_admin = true if @remote_work.user_id != current_user.id
      @remote_work.save(save_params)
      @remote_work.discard

      respond_with @remote_work
    end

    private

    def save_params
      current_user.admin? ? {} : { context: :user }
    end
  end
end
