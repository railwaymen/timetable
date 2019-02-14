# frozen_string_literal: true

class AccountingPeriodsManager
  def initialize(user_id:)
    @user_id = user_id
  end

  def check_job_exist
    @check_job_exist ||= CheckJobExist.new(worker, worker_params)
  end

  def perform_async_once
    if job_exist?
      check_job_exist.jid
    else
      worker.perform_async(worker_params)
    end
  end

  def job_exist?
    check_job_exist.call
  end

  def job_jid
    check_job_exist.jid
  end

  private

  def worker
    RecountAccountingPeriodsWorker
  end

  def worker_params
    { user_id: @user_id }
  end
end
