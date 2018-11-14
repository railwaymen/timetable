module Api
  class AccountingPeriodsController < Api::BaseController
    before_action :authenticate_admin!, except: %i[index matching_fulltime]
    respond_to :json

    helper_method :recounting

    def index
      respond_with accounting_periods
    end

    def show
      @accounting_period = AccountingPeriod.find(params[:id])
      respond_with @accounting_period
    end

    def create
      @accounting_period = AccountingPeriod.create(accounting_period_params)
      respond_with :api, @accounting_period
    end

    def update
      @accounting_period = AccountingPeriod.find(params[:id])
      @accounting_period.update(edit_accounting_period_params)
      respond_with @accounting_period
    end

    def destroy
      @accounting_period = AccountingPeriod.find(params[:id])
      @accounting_period.destroy
      respond_with @accounting_period
    end

    def next_position
      p = User.find(params[:user_id]).accounting_periods.maximum(:position)
      respond_with p ? p + 1 : 1
    end

    def generate
      AccountingPeriodsGenerator.new(user_id: params[:user_id],
                                     periods_count: params[:periods_count].to_i,
                                     start_on: Date.parse(params[:start_on])).generate
      render json: accounting_periods
    rescue ActiveRecord::RecordInvalid => e
      render status: :unprocessable_entity, json: { errors: e.message }
    end

    def matching_fulltime
      period = AccountingPeriod.where(user_id: params[:user_id], full_time: true)
                               .where('? >= starts_at AND ? <= ends_at', params[:date], params[:date]).first
      should_worked = nil
      if period.try(:starts_at) && period.starts_at <= Time.zone.today && period.ends_at >= Time.zone.today
        should_worked = period.starts_at.to_date.business_days_until(Time.zone.today + 1.day) * 8 * 3600
      end
      render status: :ok, json: { period: period, should_worked: should_worked }
    end

    def recount
      jid = AccountingPeriodsManager.new(user_id: params[:user_id]).perform_async_once
      render status: :ok, json: { jid: jid }
    end

    private

    def accounting_periods
      @accounting_periods ||= begin
        periods = current_user.admin? ? AccountingPeriod.order(position: :desc) : current_user.accounting_periods.order(position: :desc)
        periods = periods.page(params[:page])
        periods.where!(user_id: params[:user_id]) if params[:user_id].present? && current_user.admin?
      end
    end

    def accounting_period_params
      params.require(:accounting_period).permit(:user_id, :starts_at, :ends_at, :duration, :note, :closed, :position, :full_time)
    end

    def edit_accounting_period_params
      params.require(:accounting_period).permit(:starts_at, :ends_at, :duration, :note, :closed, :position, :full_time)
    end

    def recounting
      AccountingPeriodsManager.new(user_id: params[:user_id]).job_exist?
    end
  end
end
