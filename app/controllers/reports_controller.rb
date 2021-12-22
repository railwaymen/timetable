# frozen_string_literal: true

require 'csv'

class ReportsController < AuthenticatedController
  include ApplicationHelper
  before_action :authenticate_admin_or_manager_or_leader!

  def project
    csv_generator = Reports::CsvGeneratorProxy.call(
      user: current_user,
      params: params
    )

    respond_to do |format|
      format.csv do
        send_data csv_generator.generate, filename: csv_generator.filename
      end
    end
  end

  def remote_work
    csv_generator = Reports::CsvRemoteWork.new(
      user_id: params[:user_id],
      from: params[:from],
      to: params[:to]
    )

    respond_to do |format|
      format.csv do
        send_data csv_generator.generate, filename: csv_generator.filename
      end
    end
  end
end
