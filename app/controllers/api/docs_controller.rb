# frozen_string_literal: true

module Api
  class DocsController < ApplicationController
    respond_to :yaml

    def index; end
  end
end
