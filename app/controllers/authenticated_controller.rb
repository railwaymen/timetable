# frozen_string_literal: true

class AuthenticatedController < ApplicationController
  before_action :set_paper_trail_whodunnit
  before_action :authenticate_user!
end
