# frozen_string_literal: true

module Api
  class MilestonesController < Api::BaseController
    def index
      @milestones = project.milestones.kept.order(:position)
      authorize @milestones
      respond_with @milestones
    end

    def show
      @milestone = project.milestones.kept.find(params[:id])
      authorize @milestone
      respond_with @milestone
    end

    def create
      @milestone = project.milestones.create(milestone_params.merge(position: next_position))
      authorize @milestone
      respond_with @milestone
    end

    def update
      @milestone = project.milestones.kept.find(params[:id])
      authorize @milestone
      @milestone.update(milestone_params)
      respond_with @milestone
    end

    def import
      ImportJiraMilestonesWorker.perform_async(project.id, current_user.id)
    end

    def import_status
      render json: { complete: !CheckJobExist.new(ImportJiraMilestonesWorker).call }
    end

   

    # def destroy
    #   @accounting_period = AccountingPeriod.find(params[:id])
    #   @accounting_period.destroy
    #   respond_with @accounting_period
    # end

    # def next_position
    #   p = User.find(params[:user_id]).accounting_periods.maximum(:position)
    #   respond_with p ? p + 1 : 1
    # end

    # def generate
    #   AccountingPeriodsGenerator.new(user_id: params[:user_id],
    #                                  periods_count: params[:periods_count].to_i,
    #                                  start_on: Date.parse(params[:start_on])).generate
    #   render json: accounting_periods
    # rescue ActiveRecord::RecordInvalid => e
    #   render status: :unprocessable_entity, json: { errors: e.message }
    # end

    # def matching_fulltime
    #   @accounting_period = AccountingPeriod.where(user_id: filtered_user_id, full_time: true)
    #                                        .where('? >= starts_at AND ? <= ends_at', params[:date], params[:date]).first
    #   @should_worked = calculate_should_worked(@accounting_period, params[:date])
    # end

    # def recount
    #   jid = AccountingPeriodsManager.new(user_id: params[:user_id]).perform_async_once
    #   render status: :ok, json: { jid: jid }
    # end

    private

    def next_position
      (project.milestones.maximum(:position) || 0) + 1
    end

    # def calculate_should_worked(accounting_period, date)
    #   return if accounting_period.nil? || date.to_date.beginning_of_month != Time.zone.now.beginning_of_month.to_date

    #   days_to_date = @accounting_period.starts_at.to_date.business_days_until(Time.zone.today + 1.day)
    #   accounting_period_days = @accounting_period.starts_at.to_date.business_days_until(accounting_period.ends_at.end_of_day)
    #   days_to_date * (accounting_period.duration / accounting_period_days)
    # end

    # def filtered_user_id
    #   current_user.admin? ? (params[:user_id].presence || current_user.id) : current_user.id
    # end

    # def accounting_periods
    #   @accounting_periods ||= AccountingPeriod.order(position: :desc).where(user_id: filtered_user_id).page(params[:page]).per(params[:per_page] || 24)
    # end

    def milestone_params
      params.permit(:name, :starts_on, :ends_on, :note, :dev_estimate, :qa_estimate, :ux_estimate, :pm_estimate, :other_estimate)
    end

    # def edit_accounting_period_params
    #   params.require(:accounting_period).permit(:starts_at, :ends_at, :duration, :note, :closed, :position, :full_time)
    # end

    def project
      @project ||= Project.find(params[:project_id])
    end

    def recounting
      AccountingPeriodsManager.new(user_id: params[:user_id]).job_exist?
    end
  end
end
