# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::AccountingPeriodsController do
  let(:user) { create(:user) }
  let(:admin) { create(:user, :admin) }
  let(:note) { SecureRandom.hex }
  let(:starts_at) { Time.zone.now.beginning_of_day + 2.hours }
  let(:ends_at) { Time.zone.now.beginning_of_day + 4.hours }
  let(:accounting_periods_manager) { instance_double(AccountingPeriodsManager) }

  def accounting_period_response(accounting_period)
    accounting_period.attributes.slice('id', 'user_id', 'starts_at', 'ends_at', 'counted_duration', 'duration', 'closed', 'note', 'position', 'full_time', 'protected')
  end

  describe '#index' do
    it 'authenticates user' do
      get :index, format: :json
      expect(response.code).to eql('401')
    end

    it 'returns user account periods' do
      sign_in(user)
      accounting_period = create(:accounting_period, user: user)
      expect(AccountingPeriodsManager).to receive(:new).with(user_id: nil).and_return(accounting_periods_manager)
      expect(accounting_periods_manager).to receive(:job_exist?).and_return(false)
      get :index, format: :json
      expect(response.code).to eql('200')
      expect(response.body).to be_json_eql({ records: [accounting_period_response(accounting_period)], total_pages: 1, recounting: false }.to_json)
    end

    it 'filters by user_id as admin' do
      sign_in(admin)
      accounting_period = create(:accounting_period, user: user)
      expect(AccountingPeriodsManager).to receive(:new).with(user_id: user.id.to_s).and_return(accounting_periods_manager)
      expect(accounting_periods_manager).to receive(:job_exist?).and_return(false)
      get :index, params: { user_id: user.id }, format: :json
      expect(response.code).to eql('200')
      expect(response.body).to be_json_eql({ records: [accounting_period_response(accounting_period)], total_pages: 1, recounting: false }.to_json)
    end
  end

  describe '#show' do
    it 'authenticates user' do
      get :show, params: {  id: 1 }, format: :json
      expect(response.code).to eql('401')
    end

    it 'returns account period' do
      sign_in(admin)
      accounting_period = create(:accounting_period)
      get :show, params: { id: accounting_period }, format: :json
      expect(response.code).to eql('200')
      expect(response.body).to eql(accounting_period.attributes.to_json)
    end
  end

  describe '#create' do
    it 'authenticates user' do
      post :create, format: :json
      expect(response.code).to eql('401')
    end

    it 'forbids regular user' do
      sign_in(user)
      post :create, format: :json
      expect(response.code).to eql('403')
    end

    it 'creates accounting period' do
      sign_in(admin)
      user = create(:user)
      post :create, params: { accounting_period: { user_id: user.id, starts_at: starts_at, ends_at: ends_at, duration: 7000, note: note, position: 9 } }, format: :json
      expect(response.code).to eql('201')
      accounting_period = AccountingPeriod.last
      expect(accounting_period.user_id).to eql(user.id)
      expect(accounting_period.starts_at).to eql(starts_at)
      expect(accounting_period.ends_at).to eql(ends_at)
      expect(accounting_period.note).to eql(note)
      expect(accounting_period.position).to eql(9)
      expect(accounting_period.duration).to eql(7000)
      expect(response.body).to eql(accounting_period.attributes.to_json)
    end
  end

  describe '#update' do
    it 'authenticates user' do
      put :update, params: { id: 1 }, format: :json
      expect(response.code).to eql('401')
    end

    it 'forbids regular user' do
      sign_in(user)
      put :update, params: { id: 1 }, format: :json
      expect(response.code).to eql('403')
    end

    it 'updates accounting period' do
      sign_in(admin)
      accounting_period = create(:accounting_period)
      put :update, params: { id: accounting_period.id, accounting_period: { starts_at: starts_at, ends_at: ends_at, duration: 7000, note: note, position: 9 } }, format: :json
      expect(response.code).to eql('204')
      expect(accounting_period.reload.starts_at).to eql(starts_at)
      expect(accounting_period.ends_at).to eql(ends_at)
      expect(accounting_period.note).to eql(note)
      expect(accounting_period.position).to eql(9)
      expect(accounting_period.duration).to eql(7000)
      expect(response.body).to eq('')
    end
  end

  describe '#destroy' do
    it 'authenticates user' do
      delete :destroy, params: { id: 1 }, format: :json
      expect(response.code).to eql('401')
    end

    it 'forbids regular user' do
      sign_in(user)
      delete :destroy, params: { id: 1 }, format: :json
      expect(response.code).to eql('403')
    end

    it 'deletes accounting period' do
      sign_in(admin)
      accounting_period = create(:accounting_period)
      delete :destroy, params: { id: accounting_period.id }, format: :json
      expect(response.code).to eql('204')
      expect(AccountingPeriod.exists?(id: accounting_period.id)).to be false
      expect(response.body).to eq('')
    end
  end

  describe '#next_position' do
    it 'authenticates user' do
      get :next_position, format: :json
      expect(response.code).to eql('401')
    end

    it 'forbids regular user' do
      sign_in(user)
      get :next_position, format: :json
      expect(response.code).to eql('403')
    end

    it 'returns next position' do
      sign_in(admin)
      user = create(:user)
      create(:accounting_period, user: user, position: 4)
      get :next_position, params: { user_id: user.id }, format: :json
      expect(response.code).to eql('200')
      expect(response.body).to eql('5')
    end
  end

  describe '#matching_fulltime' do
    it 'authenticates user' do
      get :matching_fulltime, format: :json
      expect(response.code).to eql('401')
    end

    it 'returns stats information for full time employees' do
      user = create(:user)
      sign_in(user)
      date = Time.zone.parse('2020-04-03')

      travel_to date do
        accounting_period = create(:accounting_period, user: user, full_time: true,
                                                       duration: Time.zone.now.beginning_of_month.to_date.business_days_until(Time.zone.now.end_of_month.end_of_day) * 8.hours,
                                                       starts_at: Time.zone.now.beginning_of_month, ends_at: Time.zone.now.end_of_month)
        should_worked = accounting_period.starts_at.to_date.business_days_until(Time.zone.today + 1.day) * 8.hours
        get :matching_fulltime, params: { user_id: user.id, date: date }, format: :json
        expect(response.code).to eql('200')
        expect(response.body).to be_json_eql({ accounting_period: accounting_period_response(accounting_period), should_worked: should_worked }.to_json)
      end
    end

    it 'returns stats information for custom full time employees' do
      user = create(:user)
      sign_in(user)
      date = Time.zone.parse('2020-04-03')

      travel_to date do
        accounting_period = create(:accounting_period, duration: 147.hours, user: user, full_time: true, starts_at: Time.zone.now.beginning_of_month, ends_at: Time.zone.now.end_of_month)
        should_worked = 7.hours * 3
        get :matching_fulltime, params: { user_id: user.id, date: date }, format: :json
        expect(response.code).to eql('200')
        expect(response.body).to be_json_eql({ accounting_period: accounting_period_response(accounting_period), should_worked: should_worked }.to_json)
      end
    end
  end

  describe '#generate' do
    it 'authenticates user' do
      post :generate, format: :json
      expect(response.code).to eql('401')
    end

    it 'forbids regular user' do
      sign_in(user)
      post :generate, format: :json
      expect(response.code).to eql('403')
    end

    it 'calls AccountingPeriodGenerator' do
      starts_at = '2016-01-01'
      sign_in(admin)
      user = create(:user)
      accounting_period = create(:accounting_period, user: user, starts_at: Date.parse(starts_at) + 1.day)
      accounting_periods_generator = instance_double(AccountingPeriodsGenerator)
      expect(AccountingPeriodsGenerator).to receive(:new).with(user_id: user.id.to_s, periods_count: 4, start_on: Date.parse(starts_at)).and_return(accounting_periods_generator)
      expect(accounting_periods_generator).to receive(:generate)
      post :generate, params: { user_id: user.id, periods_count: 4, start_on: starts_at }, format: :json
      expect(response.code).to eql('200')
      expect(response.body).to be_json_eql([accounting_period].to_json)
    end

    it 'handles validation errors' do
      starts_at = '2016-01-01'
      sign_in(admin)
      user = create(:user)
      accounting_periods_generator = instance_double(AccountingPeriodsGenerator)
      expect(AccountingPeriodsGenerator).to receive(:new).with(user_id: user.id.to_s, periods_count: 4, start_on: Date.parse(starts_at)).and_return(accounting_periods_generator)
      expect(accounting_periods_generator).to receive(:generate).and_raise(ActiveRecord::RecordInvalid.new(AccountingPeriod.new))
      post :generate, params: { user_id: user.id, periods_count: 4, start_on: starts_at }, format: :json
      expect(response.code).to eql('422')
      expect(response.body).to be_json_eql({ errors: 'Validation failed: ' }.to_json)
    end
  end

  describe '#recount' do
    it 'authenticates user' do
      post :recount, format: :json
      expect(response.code).to eql('401')
    end

    it 'forbids regular user' do
      sign_in(user)
      post :recount, format: :json
      expect(response.code).to eql('403')
    end

    it 'queue RecountAccountingPeriodsWorker' do
      sign_in(admin)
      user = create(:user)
      expect(AccountingPeriodsManager).to receive(:new).with(user_id: user.id.to_s).and_return(accounting_periods_manager)
      expect(accounting_periods_manager).to receive(:perform_async_once).and_return('155470')
      post :recount, params: { user_id: user.id }, format: :json
      expect(response.code).to eql('200')
      expect(response.body).to eql({ jid: '155470' }.to_json)
    end
  end
end
