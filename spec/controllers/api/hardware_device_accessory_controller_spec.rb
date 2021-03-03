# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::HardwareDeviceAccessoriesController, type: :controller do
  describe '#index' do
    it 'correctly render collection' do
      user = FactoryBot.create(:user, :hardware_manager)
      hardware = FactoryBot.create(:hardware_device)

      sign_in user

      FactoryBot.create(
        :hardware_device_accessory,
        hardware_device: hardware
      )

      get :index, params: { hardware_device_id: hardware.id }

      expect(response.code).to eq '200'
    end
  end
end
