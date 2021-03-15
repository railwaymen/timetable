# frozen_string_literal: true

module Api
  class HardwareDevicesController < BaseController
    before_action :authenticate_admin_or_hardware_manager!

    def index
      scope = HardwareDevice.active.includes(user: :projects)
      scope = scope.search(params[:q]).order(search_strength: :desc) if params[:q].present?

      @devices = scope.page(params[:page]).order(created_at: :desc)
    end

    def archived
      scope = HardwareDevice.archived.includes(user: :projects)
      scope = scope.search(params[:q]).order(search_strength: :desc) if params[:q].present?

      @devices = scope.page(params[:page]).order(created_at: :desc)
    end

    def show
      @device = HardwareDevice.find(params[:id])
    end

    def history
      @versions = HardwareDevice.find(params[:id]).versions
    end

    def create
      @device = HardwareDevice.new(hardware_device_params)

      @device.save

      respond_with @device
    end

    def update
      device = HardwareDevice.find(params[:id])
      form = HardwareDevices::UpdateForm.new(device, permitted_params: hardware_device_params)
      form.save

      @device = form.hardware_device
      respond_with @device
    end

    def destroy
      @device = HardwareDevice.find(params[:id])

      if @device.archived
        @device.discard!
      else
        @device.update!(archived: true)
      end

      render json: {}, status: :ok
    end

    private

    def hardware_device_params # rubocop:disable Metrics/MethodLength
      params.require(:hardware_device).permit(
        :category,
        :brand,
        :device_type,
        :model,
        :serial_number,
        :year_of_production,
        :year_bought,
        :used_since,
        :cpu,
        :ram,
        :storage,
        :user_id,
        :category,
        :os_version,
        :state,
        :price,
        :note,
        :user,
        accessories_attributes: %i[id name quantity _destroy],
        images: [],
        remove_images_ids: []
      )
    end
  end
end
