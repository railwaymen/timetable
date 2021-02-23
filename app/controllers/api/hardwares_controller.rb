# frozen_string_literal: true

module Api
  class HardwaresController < Api::BaseController
    before_action :authenticate_admin_or_hardware_manager!, only: %i[change_status]
    before_action :load_hardware, only: %i[update destroy]
    respond_to :json

    def index
      hardwares = Hardware.includes(:user, :hardware_fields, :hardware_accessories).all
      hardwares = hardwares.where(user_id: params[:user_id]) if params[:user_id].present?
      hardwares = hardwares.where(status: params[:status]) if params[:status]
      @hardwares = policy_scope(hardwares)
      respond_with @hardwares
    end

    def types
      @types = Hardware.types.keys
      respond_with @types
    end

    def update
      @hardware.update(permitted_attributes(@hardware))
      authorize @hardware
      respond_with @hardware
    end

    def bulk_update
      @hardwares = policy_scope(Hardware.where(id: params[:selected_hardwares]))
      errors = HardwaresBulkUpdateService.new(@hardwares, permitted_attributes(@hardwares)).update
      if errors
        render json: { errors: errors }.to_json, status: :unprocessable_entity
      else
        respond_with @hardwares
      end
    end

    def create
      @hardware = Hardware.create(permitted_attributes(Hardware.new))
      respond_with @hardware
    end

    def destroy
      @hardware = policy_scope(Hardware.where(id: params[:id])).first&.destroy
      respond_with @hardware
    end

    def bulk_destroy
      @hardwares = policy_scope(Hardware.where(id: params[:selected_hardwares].split(',').map(&:to_i))).destroy_all
      respond_with @hardwares
    end

    def rental_agreement
      hardwares = policy_scope(Hardware.where(id: params[:ids].split(',').map(&:to_i)))
      generator = Agreements::RentalAgreementGeneratorService.new(hardwares, params)
      HardwareMailer.send_agreement_to_accountancy(current_user, generator.generate, 'rental').deliver_later
      respond_with hardwares
    end

    def return_agreement
      hardwares = policy_scope(Hardware.where(id: params[:ids].split(',').map(&:to_i)))
      generator = Agreements::ReturnAgreementGeneratorService.new(hardwares, params)
      HardwareMailer.send_agreement_to_accountancy(current_user, generator.generate, 'return').deliver_later
      respond_with hardwares
    end

    def change_status
      @hardware = policy_scope(Hardware.where(id: params[:hardware_id])).first
      @hardware.update_column(:status, permitted_attributes(@hardware)['status'])
      respond_with @hardware
    end

    private

    def load_hardware
      @hardware = policy_scope(Hardware).find(params[:id])
    end
  end
end
