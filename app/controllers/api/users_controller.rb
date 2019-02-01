module Api
  class UsersController < Api::BaseController
    before_action :authenticate_notself, only: [:update]
    before_action :authenticate_admin!, except: %i[index show update]
    before_action :authenticate_admin_or_manager_or_leader!, only: [:index]
    respond_to :json

    def index
      action = params[:filter].presence_in(visiblity_list) || 'all'
      @users = User.order('contract_name::bytea').filter_by(action.to_sym)
      respond_with @users
    end

    def show
      @user = User.with_next_and_previous_user_id.find(params[:id])
      respond_with @user
    end

    def create
      @user = User.create(user_params)
      respond_with :api, @user
    end

    def update
      @user = User.find(params[:id])
      @user.update(user_params)
      respond_with @user
    end

    private

    def visiblity_list
      %w[active inactive all]
    end

    def authenticate_notself
      authenticate_admin! unless current_user.id == params[:id].to_i
    end

    def user_params
      params.fetch(:user).permit(:email, :first_name, :last_name, :phone, :contract_name, :lang, :active)
    end
  end
end
