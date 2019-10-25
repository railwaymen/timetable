# frozen_string_literal: true

module Api
  class VacationsController < Api::BaseController
    before_action :authenticate_admin_or_manager_or_leader!, only: %i[vacation_applications decline approve undone generate_csv]
    before_action :find_vacation, only: %i[approve decline undone]
    respond_to :json

    def index
      @vacations = Vacation.where('user_id = :user_id AND (extract(year from start_date) = :year OR extract(year from start_date) = :year)',
                                  user_id: current_user.id, year: params[:year])
      @available_vacation_days = current_user.available_vacation_days
      @used_vacation_days = current_user.used_vacation_days(@vacations)
    end

    def create
      @vacation = Vacation.create(vacations_params)
      respond_with @vacation
    end

    def vacation_applications
      vacations = VacationApplicationsQuery.new(current_user, params)
      @accepted_or_declined_vacations = vacations.accepted_or_declined_vacations
      @unconfirmed_vacations = vacations.unconfirmed_vacations
      @available_vacation_days = {}
      @unconfirmed_vacations.each do |vacation|
        @available_vacation_days[vacation['user_id']] = User.find(vacation['user_id']).available_vacation_days if current_user.staff_manager?
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

    private

    def find_vacation
      @vacation = Vacation.find(params[:vacation_id])
    end

    def vacations_params
      params.require(:vacation)
            .permit(
              %i[
                start_date
                end_date
                vacation_type
                description
                user_id
              ]
            )
    end
  end
end
