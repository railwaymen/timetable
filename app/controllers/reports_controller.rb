# frozen_string_literal: true

require 'csv'

class ReportsController < AuthenticatedController
  include ApplicationHelper
  before_action :authenticate_admin_or_manager_or_leader!

  def project
    csv = Reports::CsvGeneratorService.new(user: current_user, params: params)

    respond_to do |format|
      format.csv { send_data csv.generate, filename: csv.filename }
    end
  end
end
