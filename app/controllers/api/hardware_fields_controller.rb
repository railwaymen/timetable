# frozen_string_literal: true

module Api
  class HardwareFieldsController < Api::BaseController
    respond_to :json

    def create
      hardware = policy_scope(Hardware).find(params[:hardware_id])
      @field = hardware.hardware_fields.build(hardware_fields_params)
      authorize @field
      @field.save
      respond_with @field
    end

    def update
      @field = HardwareField.find(params[:id])
      authorize @field
      @field.update(hardware_fields_params)
      respond_with @field
    end

    def destroy
      @field = HardwareField.find(params[:id])
      authorize @field
      @field.destroy
      respond_with @field
    end

    private

    def hardware_fields_params
      params.require(:field).permit(:name, :value)
    end
  end
end
