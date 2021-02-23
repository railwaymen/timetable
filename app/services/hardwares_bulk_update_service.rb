# frozen_string_literal: true

class HardwaresBulkUpdateService
  def initialize(hardwares, params)
    @hardwares = hardwares
    @params = params
    @errors = nil
  end

  def update
    Hardware.transaction do
      @hardwares.each do |hardware|
        @errors = hardware.errors.full_messages unless hardware.update(@params)
      end
      raise ActiveRecord::Rollback if @errors
    end
    @errors
  end
end
