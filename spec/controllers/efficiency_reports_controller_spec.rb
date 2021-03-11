# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EfficiencyReportsController, type: :controller do
  describe 'show' do
    context 'when guest' do
      it 'return unauthorized' do
        get :show

        expect(response).to redirect_to(new_user_session_path)
      end
    end

    context 'when user' do
      it 'return unauthorized' do
        user = FactoryBot.create(:user)

        sign_in(user)

        get :show, params: { from: Time.current.to_s, to: (Time.current + 1.day).to_s }

        expect(response.code).to eq '403'
      end
    end

    context 'when manager' do
      context 'when csv format' do
        it 'serve report' do
          user = FactoryBot.create(:user, :manager)

          sign_in(user)

          get :show, params: { from: Time.current.to_s, to: (Time.current + 1.day).to_s }, format: :csv

          expect(response.code).to eq '200'
        end
      end

      context 'when xlsx format' do
        it 'serve report' do
          user = FactoryBot.create(:user, :manager)

          sign_in(user)

          get :show, params: { from: Time.current.to_s, to: (Time.current + 1.day).to_s }, format: :xlsx

          expect(response.code).to eq '200'
        end
      end
    end

    context 'when admin' do
      context 'when csv format' do
        it 'serve report' do
          user = FactoryBot.create(:user, :admin)

          sign_in(user)

          get :show, params: { from: Time.current.to_s, to: (Time.current + 1.day).to_s }, format: :csv

          expect(response.code).to eq '200'
        end
      end

      context 'when xlsx format' do
        it 'serve report' do
          user = FactoryBot.create(:user, :admin)

          sign_in(user)

          get :show, params: { from: Time.current.to_s, to: (Time.current + 1.day).to_s }, format: :xlsx

          expect(response.code).to eq '200'
        end
      end
    end
  end
end
