require 'rails_helper'
require 'sidekiq/testing'

describe CheckJobExist do
  let(:user) { create(:user) }

  it 'returns true because job exists' do
    user = create(:user)
    user2 = create(:user)
    expect(Sidekiq).to receive(:redis).at_least(:once).and_return(['sidekiq:status:jid1', 'sidekiq:status:jid2', 'sidekiq:status:jid3', 'sidekiq:status:jid4'])
    expect(Sidekiq::Status).to receive(:get_all).with('jid1').and_return('worker' => 'AnotherWorker', 'args' => "[{\"user_id\":\"#{user.id}\"}]", 'status' => 'queued', 'jid' => 'jid1')
    expect(Sidekiq::Status).to receive(:get_all).with('jid2').and_return('worker' => 'RecountAccountingPeriodsWorker', 'args' => "[{\"user_id\":\"#{user.id}\"}]", 'status' => 'complete', 'jid' => 'jid2')
    expect(Sidekiq::Status).to receive(:get_all).with('jid3').and_return('worker' => 'RecountAccountingPeriodsWorker', 'args' => "[{\"user_id\":\"#{user2.id}\"}]", 'status' => 'queued', 'jid' => 'jid3')
    expect(Sidekiq::Status).to receive(:get_all).with('jid4').and_return('worker' => 'RecountAccountingPeriodsWorker', 'args' => "[{\"user_id\":\"#{user.id}\"}]", 'status' => 'queued', 'jid' => 'jid4')
    check_job_exist = CheckJobExist.new(RecountAccountingPeriodsWorker, user_id: user.id.to_s)
    expect(check_job_exist.call).to eq(true)
    expect(check_job_exist.jid).to eq('jid4')
  end

  it 'returns false because there is job but not for specific user' do
    user = create(:user)
    user2 = create(:user)
    expect(Sidekiq).to receive(:redis).at_least(:once).and_return(['sidekiq:status:jid1', 'sidekiq:status:jid2', 'sidekiq:status:jid3'])
    expect(Sidekiq::Status).to receive(:get_all).with('jid1').and_return('worker' => 'AnotherWorker', 'args' => "[{\"user_id\":\"#{user.id}\"}]", 'status' => 'queued', 'jid' => 'jid1')
    expect(Sidekiq::Status).to receive(:get_all).with('jid2').and_return('worker' => 'RecountAccountingPeriodsWorker', 'args' => "[{\"user_id\":\"#{user.id}\"}]", 'status' => 'complete', 'jid' => 'jid2')
    expect(Sidekiq::Status).to receive(:get_all).with('jid3').and_return('worker' => 'RecountAccountingPeriodsWorker', 'args' => "[{\"user_id\":\"#{user2.id}\"}]", 'status' => 'queued', 'jid' => 'jid3')
    check_job_exist = CheckJobExist.new(RecountAccountingPeriodsWorker, user_id: user.id.to_s)
    expect(check_job_exist.call).to eq(false)
    expect(check_job_exist.jid).to eq(nil)
  end

  it 'returns false because there is job in queue' do
    check_job_exist = CheckJobExist.new(RecountAccountingPeriodsWorker, user_id: user.id.to_s)
    expect(check_job_exist.call).to eq(false)
    expect(check_job_exist.jid).to eq(nil)
  end
end
