# frozen_string_literal: true

module HardwareDevices
  class UpdateForm
    attr_reader :hardware_device

    def initialize(hardware_device, permitted_params: {})
      @hardware_device = hardware_device

      @remove_images_ids = permitted_params[:remove_images_ids] || []
      @user_id = permitted_params[:user_id].to_i.zero? ? nil : permitted_params[:user_id]

      @params = permitted_params.reject { |key| key.to_sym == :remove_images_ids }
    end

    def save
      @hardware_device.assign_attributes(@params.merge(user_id: @user_id).except(:images))

      ActiveRecord::Base.transaction(&save_transaction)
    end

    private

    def save_transaction
      proc do
        @hardware_device.images.where(id: @remove_images_ids).map(&:destroy!) if @remove_images_ids&.any?
        @params[:images]&.each do |image|
          @hardware_device.images.attach(image)
        end
        @hardware_device.save!
      rescue ActiveRecord::RecordInvalid
        raise ActiveRecord::Rollback
      end
    end
  end
end
