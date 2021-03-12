# frozen_string_literal: true

module Api
  class HardwareDeviceAccessoriesController < BaseController
    before_action :authenticate_admin_or_hardware_manager!

    def index
      device = HardwareDevice.find(params[:hardware_device_id])

      @accessories = device.accessories
    end
  end
end
