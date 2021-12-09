# frozen_string_literal: true

module Api
  class HardwareDevicesController < BaseController
    before_action :authenticate_admin_or_hardware_manager!

    def index
      scope = HardwareDevice.active.includes(user: :projects)
      scope = scope.search(params[:q]).order(search_strength: :desc) if params[:q].present?
      scope = scope.where(user_id: nil) if params[:unassigned_only].present?

      @devices = scope.page(params[:page]).order(created_at: :desc)
    end

    def archived
      scope = HardwareDevice.archived.includes(user: :projects)
      scope = scope.search(params[:q]).order(search_strength: :desc) if params[:q].present?
      scope = scope.where(user_id: nil) if params[:unassigned_only].present?

      @devices = scope.page(params[:page]).order(created_at: :desc)
    end

    def show
      @device = HardwareDevice.find(params[:id])
    end

    def history
      @versions = HardwareDevice.find(params[:id]).versions
    end

    def device_agreement # rubocop:disable Metrics/MethodLength
      device = HardwareDevice.active.find(params[:id])

      generator = HardwareDevices::Agreements::DeviceAgreementService.new(
        device,
        company_id: agreement_params[:company_id],
        borrower_id: device.user.id,
        type: agreement_type
      )

      send_data(
        generator.generate,
        filename: "#{device.user.first_name}_#{device.user.last_name}_rental_#{Time.zone.today}.pdf"
      )
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

    def agreement_type
      agreement_params[:type]&.to_sym.presence_in(HardwareDevice::AGREEMENT_TYPES) || HardwareDevice::AGREEMENT_TYPES[0]
    end

    def agreement_params
      params.permit(:company_id, :lender_id, :type)
    end

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
        :invoice,
        :user,
        accessories_attributes: %i[id name quantity _destroy],
        images: [],
        remove_images_ids: []
      )
    end
  end
end
