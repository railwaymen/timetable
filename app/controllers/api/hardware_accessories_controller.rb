# frozen_string_literal: true

module Api
  class HardwareAccessoriesController < Api::BaseController
    respond_to :json

    def create
      hardware = policy_scope(Hardware).find(params[:hardware_id])
      @accessory = hardware.hardware_accessories.build(hardware_accessories_params)
      authorize @accessory
      @accessory.save
      respond_with @accessory
    end

    def update
      @accessory = HardwareAccessory.find(params[:id])
      authorize @accessory
      @accessory.update(hardware_accessories_params)
      respond_with @accessory
    end

    def destroy
      @accessory = HardwareAccessory.find(params[:id])
      authorize @accessory
      @accessory.destroy
      respond_with @accessory
    end

    private

    def hardware_accessories_params
      params.require(:accessory).permit(:name)
    end
  end
end
