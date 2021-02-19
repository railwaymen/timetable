# frozen_string_literal: true

class EfficiencyReportsController < ApplicationController
  before_action :authenticate_admin_or_manager!

  def show # rubocop:disable Metrics/MethodLength
    projects_workbook = ::Reports::Efficiency::XlsxProjectsService.new(
      starts_at: starts_at,
      ends_at: ends_at
    ).call
    users_workbook = ::Reports::Efficiency::XlsxUsersService.new(
      workbook: projects_workbook,
      starts_at: starts_at,
      ends_at: ends_at,
      sheet_index: 1
    ).call

    send_data(users_workbook.stream.string, filename: "EfficiencyReport-#{starts_at}-#{ends_at}.xlsx", disposition: 'attachment')
  end

  private

  def starts_at
    Time.zone.parse(params[:from]).beginning_of_day
  end

  def ends_at
    Time.zone.parse(params[:to]).end_of_day
  end
end
