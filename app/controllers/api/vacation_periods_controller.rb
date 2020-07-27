# frozen_string_literal: true

module Api
  class VacationPeriodsController < Api::BaseController
    before_action :authenticate_admin!, except: %i[index]
    before_action :find_period, only: %i[show update]

    def index
      respond_with @vacation_periods = vacation_periods.page(params[:page]).per(params[:per_page] || 24)
    end

    def show
      respond_with @vacation_period
    end

    def update
      authorize(@vacation_period)
      @vacation_period.update(vacation_period_params)
      respond_with @vacation_period
    end

    def generate
      authorize(VacationPeriod.new)
      VacationPeriodsGenerator.new.generate
      render json: vacation_periods
    end

    private

    def vacation_periods
      periods = current_user.vacation_periods.order(:created_at)
      periods = periods.rewhere(user_id: params[:user_id]) if params[:user_id].present?
      policy_scope(periods)
    end

    def find_period
      @vacation_period = VacationPeriod.find(params[:id])
    end

    def vacation_period_params
      params.require(:vacation_period)
            .permit(
              %i[
                vacation_days
                note
                closed
              ]
            )
    end
  end
end
