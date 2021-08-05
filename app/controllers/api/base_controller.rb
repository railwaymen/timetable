# frozen_string_literal: true

module Api
  class BaseController < ApplicationController
    self.responder = ApiResponder
    before_action :set_paper_trail_whodunnit
    before_action :authenticate_user!
    respond_to :json

    skip_before_action :verify_authenticity_token

    private

    def append_info_to_payload(payload)
      super
      payload[:user_id] = current_user&.id
    end
  end
end
