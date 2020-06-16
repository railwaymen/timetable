# frozen_string_literal: true

require 'rails_helper'
require 'sidekiq/testing'

describe CheckJobExist do
  let(:user) { create(:user) }

  it 'returns true because job exists' do
    expect(Sidekiq).to receive(:redis).at_least(:once).and_return(['sidekiq:status:jid1', 'sidekiq:status:jid2', 'sidekiq:status:jid3'])
    expect(Sidekiq::Status).to receive(:get_all).with('jid1').and_return('worker' => 'AnotherWorker', 'args' => '', 'status' => 'queued', 'jid' => 'jid1')
    expect(Sidekiq::Status).to receive(:get_all).with('jid2').and_return('worker' => 'RecountAccountingPeriodsWorker', 'args' => '', 'status' => 'complete', 'jid' => 'jid2')
    expect(Sidekiq::Status).to receive(:get_all).with('jid3').and_return('worker' => 'RecountAccountingPeriodsWorker', 'args' => '', 'status' => 'queued', 'jid' => 'jid3')
    check_job_exist = CheckJobExist.new(RecountAccountingPeriodsWorker)
    expect(check_job_exist.call).to eq(true)
    expect(check_job_exist.jid).to eq('jid3')
  end

  it 'returns false because there is job in queue' do
    expect(Sidekiq).to receive(:redis).at_least(:once).and_return([])
    check_job_exist = CheckJobExist.new(RecountAccountingPeriodsWorker)
    expect(check_job_exist.call).to eq(false)
    expect(check_job_exist.jid).to eq(nil)
  end
end
