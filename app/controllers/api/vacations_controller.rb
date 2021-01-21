# frozen_string_literal: true

module Api
  class VacationsController < Api::BaseController
    before_action :authenticate_admin_or_manager_or_leader!, only: %i[vacation_applications show decline approve undone generate_csv generate_yearly_report]
    before_action :authenticate_admin!, only: %i[update_dates]
    before_action :find_vacation, only: %i[approve decline undone self_decline update_dates]
    around_action :disable_paper_trail, only: %i[approve decline undone self_decline update_dates]

    def index # rubocop:disable Metrics/MethodLength
      selected_user =
        if current_user.staff_manager?
          params[:user_id] && User.kept.find(params[:user_id]) || current_user
        else
          current_user
        end
      @vacations = Vacation.where('user_id = :user_id AND (extract(year from start_date) = :year OR extract(year from start_date) = :year)',
                                  user_id: selected_user.id, year: params[:year]).order(:start_date)
      vacation_period = selected_user.vacation_periods.where('extract(year from starts_at) = ?', params[:year]).first!
      @available_vacation_days = selected_user.available_vacation_days(@vacations, vacation_period)
      @used_vacation_days = selected_user.used_vacation_days(@vacations)
    end

    def create
      @vacation = current_user.vacations.build
      @vacation.assign_attributes(permitted_attributes(@vacation))
      @vacation.business_days_count = @vacation.start_date.business_days_until(@vacation.end_date + 1.day) if @vacation.valid?
      VacationMailer.send_information_to_accountancy(@vacation).deliver_later if @vacation.save
      respond_with @vacation
    end

    def show
      @vacation = VacationApplicationsQuery.new(current_user, params).vacation.first
      @available_vacation_days = User.find(@vacation['user_id']).available_vacation_days
      respond_with @vacation
    end

    def vacation_applications
      vacations = VacationApplicationsQuery.new(current_user, params)
      @accepted_or_declined_vacations = vacations.accepted_or_declined_vacations
      @unconfirmed_vacations = vacations.unconfirmed_vacations
      @available_vacation_days = {}
      return unless current_user.staff_manager?

      @unconfirmed_vacations.each do |vacation|
        @available_vacation_days[vacation['user_id']] = User.find(vacation['user_id']).available_vacation_days
      end
    end

    def decline
      vacation_service = VacationService.new(vacation: @vacation, current_user: current_user, params: params)
      @response = vacation_service.decline
      respond_with @response
    end

    def approve
      vacation_service = VacationService.new(vacation: @vacation, current_user: current_user, params: params)
      @response = vacation_service.approve
      respond_with @response
    end

    def undone
      vacation_service = VacationService.new(vacation: @vacation, current_user: current_user, params: params)
      @response = vacation_service.undone
      respond_with @response
    end

    def generate_csv
      csv_generator = CsvStaffGeneratorService.new(
        user_id: params[:user_id],
        start_date: params[:start_date],
        end_date: params[:end_date]
      )

      respond_to do |format|
        format.csv do
          send_data csv_generator.generate, filename: csv_generator.filename
        end
      end
    end

    def destroy
      @vacation = Vacation.find(params[:id])
      @vacation.destroy
      respond_with @vacation
    end

    def self_decline
      @vacation.update(self_declined: true, status: :declined)
      respond_with @vacation
    end

    def generate_yearly_report
      csv_generator = VacationsYearlyReportGenerator.new

      respond_to do |format|
        format.csv do
          send_data csv_generator.generate, filename: 'vacations_yearly_report.csv'
        end
      end
    end

    def update_dates
      vacation_service = VacationService.new(vacation: @vacation, current_user: current_user, params: params)
      @response = vacation_service.update_dates
      respond_with @response
    end

    private

    def find_vacation
      @vacation = policy_scope(Vacation).find(params[:vacation_id])
    end
  end
end
