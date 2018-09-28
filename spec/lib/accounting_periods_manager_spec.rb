require 'rails_helper'
require 'sidekiq/testing'

describe AccountingPeriodsManager do
  let(:user) { create(:user) }
  let(:check_job_exist) { double('check_job_exist') }

  it 'add job because there is no same job in queue' do
    expect(CheckJobExist).to receive(:new).with(RecountAccountingPeriodsWorker, user_id: user.id).and_return(check_job_exist)
    expect(check_job_exist).to receive(:call).and_return(false)
    expect(check_job_exist).to receive(:jid).and_return('26w')

    manager = AccountingPeriodsManager.new(user_id: user.id)

    expect do
      manager.perform_async_once
    end.to change { RecountAccountingPeriodsWorker.jobs.size }.by(1)
    expect(manager.job_jid).to eq('26w')
  end

  it 'do not add job because there is same job in queue' do
    expect(CheckJobExist).to receive(:new).with(RecountAccountingPeriodsWorker, user_id: user.id).and_return(check_job_exist)
    expect(check_job_exist).to receive(:call).and_return(true)
    expect(check_job_exist).to receive(:jid).twice.and_return('26w')

    manager = AccountingPeriodsManager.new(user_id: user.id)

    RecountAccountingPeriodsWorker.perform_async(user_id: user.id)
    expect do
      manager.perform_async_once
    end.to change { RecountAccountingPeriodsWorker.jobs.size }.by(0)
    expect(manager.job_jid).to eq('26w')
  end
end
