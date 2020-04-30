# frozen_string_literal: true

module Api
  class HardwareFieldsController < Api::BaseController
    respond_to :json

    def create
      hardware = Hardware.find(params[:hardware_id])
      @field = HardwareField.create(hardware_fields_params)
      hardware.hardware_fields << @field
      respond_with @field
    end

    def update
      @field = HardwareField.find(params[:id])
      @field.update(hardware_fields_params)
      respond_with @field
    end

    def destroy
      @field = HardwareField.find(params[:id]).destroy
      respond_with @field
    end

    private

    def hardware_fields_params
      params.require(:field).permit(:name, :value)
    end
  end
end
