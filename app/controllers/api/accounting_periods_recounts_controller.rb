module Api
  class AccountingPeriodsRecountsController < AuthenticatedController
    def status
      accounting_periods_manager = AccountingPeriodsManager.new(user_id: params[:user_id])
      render json: { jid: accounting_periods_manager.job_jid, complete: !accounting_periods_manager.job_exist? }
    end
  end
end
