# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::AccountingPeriodsRecountsController do
  let(:accounting_periods_manager) { double :accounting_periods_manager }

  describe '#status' do
    it 'authenticates user' do
      get :status, format: :json
      expect(response.code).to eql('401')
    end

    it 'check not existing job in sidekiq' do
      user = create(:user)
      sign_in(user)
      expect(AccountingPeriodsManager).to receive(:new).with(user_id: user.id.to_s).and_return(accounting_periods_manager)
      expect(accounting_periods_manager).to receive(:job_jid).and_return(nil)
      expect(accounting_periods_manager).to receive(:job_exist?).and_return(false)
      get :status, params: { jid: 1, user_id: user.id }, format: :json
      expect(response.code).to eql('200')
      expect(response.body).to eql({ jid: nil, complete: true }.to_json)
    end

    it 'check existing job in sidekiq' do
      user = create(:user)
      sign_in(user)
      expect(AccountingPeriodsManager).to receive(:new).with(user_id: user.id.to_s).and_return(accounting_periods_manager)
      expect(accounting_periods_manager).to receive(:job_jid).and_return('25a')
      expect(accounting_periods_manager).to receive(:job_exist?).and_return(true)
      get :status, params: { jid: 1, user_id: user.id }, format: :json
      expect(response.code).to eql('200')
      expect(response.body).to eql({ jid: '25a', complete: false }.to_json)
    end
  end
end
