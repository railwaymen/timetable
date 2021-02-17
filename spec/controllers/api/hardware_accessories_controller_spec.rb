# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::HardwareAccessoriesController do
  describe '#create' do
    it 'creates hardware accessory for hardware' do
      user = create(:user)
      hardware = create(:hardware, user: user)
      sign_in user

      params = {
        format: 'json',
        hardware_id: hardware.id,
        accessory: { name: 'Accessory1' }
      }

      expect { post :create, params: params }
        .to change { HardwareAccessory.count }.by(1)
    end
  end

  describe '#update' do
    it 'updates hardware accessory' do
      accessory = create(:hardware_accessory)
      user = create(:user, :hardware_manager)

      sign_in user

      params = {
        format: 'json',
        hardware_id: accessory.hardware_id,
        id: accessory.id,
        accessory: {
          name: 'NewAccessory'
        }
      }

      put :update, params: params

      expect(accessory.reload.name).to eq('NewAccessory')
    end
  end

  describe '#destroy' do
    it 'destories hardware accessory' do
      user = create(:user)
      accessory = create(:hardware_accessory)

      sign_in user

      params = {
        format: 'json',
        id: accessory.id,
        hardware_id: accessory.hardware_id
      }

      expect { delete :destroy, params: params }
        .to change { HardwareAccessory.count }.by(-1)
    end
  end
end
