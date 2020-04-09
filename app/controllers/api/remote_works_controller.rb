# frozen_string_literal: true

module Api
  class RemoteWorksController < Api::BaseController
    respond_to :json

    def index
      @remote_works = policy_scope(RemoteWork).active.order(starts_at: :desc)
      @remote_works.where!(user_id: params.require(:user_id))
      @remote_works = @remote_works.page(params[:page])

      respond_with @remote_works
    end

    def create
      @remote_work_form = RemoteWorkForm.new(remote_work_params.merge(creator_id: current_user.id))
      authorize @remote_work_form.remote_work

      @remote_work_form.save(save_params)
      respond_with @remote_work_form
    end

    def update
      @remote_work = RemoteWork.active.find(params[:id])
      authorize @remote_work

      @remote_work.assign_attributes(remote_work_params)
      @remote_work.updated_by_admin = true if @remote_work.user_id != current_user.id
      @remote_work.save(save_params)

      respond_with @remote_work
    end

    def destroy
      @remote_work = RemoteWork.active.find(params[:id])
      authorize @remote_work

      @remote_work.updated_by_admin = true if @remote_work.user_id != current_user.id
      @remote_work.active = false
      @remote_work.save(save_params)

      respond_with @remote_work
    end

    private

    def save_params
      current_user.admin? ? {} : { context: :user }
    end

    def remote_work_params
      params.require(:remote_work).permit(%i[user_id note starts_at ends_at])
    end
  end
end
