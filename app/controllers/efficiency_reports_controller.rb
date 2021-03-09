# frozen_string_literal: true

class EfficiencyReportsController < ApplicationController
  before_action :authenticate_admin_or_manager!

  include Reports::ReportsHelper

  def show
    respond_to do |format|
      format.xlsx(&xlsx_format_response)
      format.csv(&csv_format_response)
    end
  end

  private

  def csv_format_response
    proc {
      projects_csv = ::Reports::Efficiency::Csv::ProjectsService.new(starts_at: starts_at, ends_at: ends_at)
      users_csv = ::Reports::Efficiency::Csv::UsersService.new(starts_at: starts_at, ends_at: ends_at)

      report = params[:file] == 'users' ? users_csv.call : projects_csv.call

      send_data(report, filename: "#{generate_report_name(starts_at, ends_at)}.csv", disposition: 'attachment')
    }
  end

  def xlsx_format_response
    proc {
      projects_workbook = ::Reports::Efficiency::Xlsx::ProjectsService.new(starts_at: starts_at, ends_at: ends_at).call
      users_workbook = ::Reports::Efficiency::Xlsx::UsersService.new(
        workbook: projects_workbook,
        starts_at: starts_at,
        ends_at: ends_at,
        sheet_index: 1
      ).call

      send_data(users_workbook.stream.string, filename: "#{generate_report_name(starts_at, ends_at)}.xlsx", disposition: 'attachment')
    }
  end

  def starts_at
    Time.zone.parse(params[:from]).beginning_of_day
  end

  def ends_at
    Time.zone.parse(params[:to]).end_of_day
  end
end
