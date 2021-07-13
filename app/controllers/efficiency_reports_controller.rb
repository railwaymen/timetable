# frozen_string_literal: true

class EfficiencyReportsController < ApplicationController
  before_action :authenticate_admin_or_manager!

  include Reports::ReportsHelper

  def show
    projects_workbook = Reports::Efficiency::Xlsx::ProjectsService.new(starts_at: starts_at, ends_at: ends_at).call
    users_workbook = Reports::Efficiency::Xlsx::UsersService.new(
      workbook: projects_workbook,
      starts_at: starts_at,
      ends_at: ends_at,
      sheet_index: 1
    ).call

    send_data(users_workbook.stream.string, filename: "#{generate_report_name(starts_at, ends_at)}.xlsx", disposition: 'attachment')
  end

  private

  def starts_at
    Time.zone.parse(params[:from]).beginning_of_day
  end

  def ends_at
    Time.zone.parse(params[:to]).end_of_day
  end
end
