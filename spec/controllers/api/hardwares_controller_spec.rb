# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::HardwaresController do
  render_views

  describe '#index' do
    context 'when user is employee' do
      it 'returns all user hardwares' do
        user = create(:user)
        create_list(:hardware, 2, user: user)
        sign_in user

        get :index, params: { format: 'json' }
        expect(JSON.parse(response.body).count).to eq(2)
      end
    end

    context 'when user is hardware manager' do
      it 'returns all hardwares' do
        admin = create(:user, :hardware_manager)
        create_list(:hardware, 2)
        sign_in admin

        get :index, params: { format: 'json' }
        expect(JSON.parse(response.body).count).to eq(2)
      end
    end
  end

  describe '#types' do
    it 'returns all hardware types' do
      user = create(:user)
      sign_in user

      get :types, params: { format: 'json' }
      expected_response = { types: Hardware.types.keys }.stringify_keys
      expect(JSON.parse(response.body)).to eq(expected_response)
    end
  end

  describe '#update' do
    context 'when hardware is locked' do
      context 'when user is normal user' do
        it "doesn't update hardware" do
          user = create(:user)
          hardware = create(:hardware, user: user, locked: true)
          sign_in user

          params = {
            format: 'json',
            id: hardware.id,
            hardware: { serial_number: 'SERIAL' }
          }

          expect { put(:update, params: params) }.to raise_error(Pundit::NotAuthorizedError)
        end
      end

      context 'when user is hardware manager' do
        it 'updates hardware' do
          user = create(:user, :hardware_manager)
          hardware = create(:hardware, user: user, locked: true)
          sign_in user

          params = {
            format: 'json',
            id: hardware.id,
            hardware: { serial_number: 'SERIAL' }
          }

          put :update, params: params
          expect(hardware.reload.serial_number).to eq('SERIAL')
        end
      end
    end

    context 'when hardware is unlocked' do
      it 'updates hardware' do
        user = create(:user)
        hardware = create(:hardware, user: user, locked: false)
        sign_in user

        params = {
          format: 'json',
          id: hardware.id,
          hardware: { serial_number: 'SERIAL' }
        }

        put :update, params: params
        expect(hardware.reload.serial_number).to eq('SERIAL')
      end
    end
  end

  describe '#create' do
    it 'creates hardware' do
      user = create(:user)
      sign_in user
      params = {
        format: 'json',
        hardware: {
          model: 'model',
          manufacturer: 'manufacturer',
          serial_number: 'serial_number',
          type: 'laptop',
          user: user
        }
      }

      expect { post :create, params: params }
        .to change { Hardware.count }.by(1)
    end
  end

  describe '#destroy' do
    it 'destroies hardware' do
      user = create(:user)
      hardware = create(:hardware, user: user)
      sign_in user

      params = { format: 'json', id: hardware.id }
      expect { delete :destroy, params: params }
        .to change { Hardware.count }.by(-1)
    end
  end
end
