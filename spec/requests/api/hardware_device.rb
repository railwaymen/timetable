# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'HardwareDevice', type: :request do
  context 'when uploaded heic/heif image' do
    it 'create png image variant' do
      user = create(:user, :hardware_manager)
      hardware_device = create(:hardware_device)
      heic_image = fixture_file_upload('files/hardware.heic', 'image/heic')
      hardware_device.images.attach(heic_image)

      sign_in user

      get "/api/hardware_devices/#{hardware_device.id}"
      active_storage_representation_source = JSON.parse(response.body)['images'][0]['source']

      get active_storage_representation_source

      expect(response.headers['location'].end_with?('.png')).to eq(true)
    end
  end
end
