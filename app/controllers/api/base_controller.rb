# frozen_string_literal: true

module Api
  class BaseController < ApplicationController
    self.responder = ApiResponder
    before_action :set_paper_trail_whodunnit
    before_action :authenticate_user!
    before_action :set_raven_context

    skip_before_action :verify_authenticity_token

    private

    def set_raven_context
      Raven.user_context(id: current_user.id)
    end
  end
end
