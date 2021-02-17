# frozen_string_literal: true

module Api
  class CompaniesController < Api::BaseController
    respond_to :json

    def index
      @companies = Company.includes(:lenders).all
      respond_with @companies
    end
  end
end
