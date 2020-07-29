# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::VacationPeriodsController do
  let(:user) { create(:user) }
  let(:staff_manager) { create(:user, :staff_manager) }
  let(:note) { SecureRandom.hex }
  let(:vacation_period_generator) { instance_double(VacationPeriodsGenerator) }

  def vacation_period_response(vacation_period)
    vacation_period.attributes.slice('id', 'user_id', 'starts_at', 'ends_at', 'vacation_days', 'note', 'closed')
  end

  describe '#index' do
    it 'authenticates user' do
      get :index, format: :json
      expect(response.code).to eql('401')
    end

    it 'returns user vacation periods' do
      sign_in(user)
      vacation_period = create(:vacation_period, user: user)
      get :index, format: :json
      expect(response.code).to eql('200')
      expect(response.body).to be_json_eql({ total_pages: 1, records: [vacation_period_response(vacation_period)] }.to_json)
    end

    it 'returns all vacation periods as staff manager' do
      sign_in(staff_manager)
      vacation_period = create(:vacation_period)
      get :index, params: { user_id: vacation_period.user_id }, format: :json
      expect(response.code).to eql('200')
      expect(response.body).to be_json_eql({ total_pages: 1, records: [vacation_period_response(vacation_period)] }.to_json)
    end

    it 'filters by user_id by staff manager' do
      sign_in(staff_manager)
      vacation_period = create(:vacation_period, user: user)
      get :index, params: { user_id: user.id }, format: :json
      expect(response.code).to eql('200')
      expect(response.body).to be_json_eql({ total_pages: 1, records: [vacation_period_response(vacation_period)] }.to_json)
    end
  end

  describe '#show' do
    it 'authenticates user' do
      get :show, params: { id: 1 }, format: :json
      expect(response.code).to eql('401')
    end

    it 'returns vacation period' do
      sign_in(staff_manager)
      vacation_period = create(:vacation_period)
      get :show, params: { id: vacation_period.id }, format: :json
      expect(response.code).to eql('200')
      expect(response.body).to eql(vacation_period_response(vacation_period).to_json)
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

    it 'updates vacation period' do
      sign_in(staff_manager)
      vacation_period = create(:vacation_period)
      put :update, params: { id: vacation_period.id, vacation_period: { vacation_days: 50, note: note } }, format: :json
      expect(response.code).to eql('204')
      expect(vacation_period.reload.vacation_days).to eql(50)
      expect(vacation_period.note).to eql(note)
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

    it 'generate missing vacation periods for users' do
      sign_in(staff_manager)
      expect(VacationPeriodsGenerator).to receive(:new).and_return(vacation_period_generator)
      expect(vacation_period_generator).to receive(:generate).and_return(nil)
      post :generate, format: :json
      expect(response.code).to eql('200')
    end
  end
end
