# frozen_string_literal: true

module Api
  class HardwaresController < Api::BaseController
    respond_to :json

    def index
      hardwares = Hardware.all
      hardwares = hardwares.where(user_id: params[:user_id]) if params[:user_id]
      @hardwares = policy_scope(hardwares)
      respond_with @hardwares
    end

    def types
      @types = Hardware.types.keys
      respond_with @types
    end

    def update
      @hardware = policy_scope(Hardware).find(params[:id])
      @hardware.update(permitted_attributes(@hardware))
      authorize @hardware
      respond_with @hardware
    end

    def create
      @hardware = Hardware.create(permitted_attributes(Hardware.new))
      respond_with @hardware
    end

    def destroy
      @hardware = policy_scope(Hardware).find(params[:id]).destroy
      respond_with @hardware
    end
  end
end
