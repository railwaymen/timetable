# frozen_string_literal: true

module Api
  class UsersController < Api::BaseController
    before_action :authenticate_notself, only: [:update]
    before_action :authenticate_admin!, except: %i[index show update export]
    before_action :authenticate_admin_or_manager_or_leader!, only: :export

    def index
      authorize User
      action = params[:filter].presence_in(visiblity_list) || 'active'
      @users = User.includes(:tags).order(Arel.sql('contract_name::bytea ASC')).filter_by(action.to_sym)
      @users = @users.reorder(:last_name) if params.key?(:staff)
      respond_with @users
    end

    def show
      @user = User.with_next_and_previous_user_id.find(params[:id])
      respond_with @user
    end

    def create
      @user = User.new
      UpdateUserForm.new(permitted_attributes(@user).merge(user: @user)).save
      respond_with :api, @user
    end

    def update
      @user = User.find(params[:id])
      UpdateUserForm.new(permitted_attributes(@user).merge(user: @user)).save
      respond_with @user
    end

    def export
      filter = params[:filter].presence_in(visiblity_list) || 'active'

      csv_generator = CsvPeople.new(filter: filter)

      respond_to do |format|
        format.csv do
          send_data csv_generator.generate, filename: csv_generator.filename
        end
      end
    end

    private

    def visiblity_list
      %w[active inactive all]
    end

    def authenticate_notself
      authenticate_admin! unless current_user.id == params[:id].to_i
    end
  end
end
