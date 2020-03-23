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
  end
end
