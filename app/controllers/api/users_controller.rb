# frozen_string_literal: true

module Api
  class UsersController < Api::BaseController
    before_action :authenticate_notself, only: [:update]
    before_action :authenticate_admin!, except: %i[index show update incoming_birthdays]
    before_action :authenticate_admin_or_manager!, only: %i[index incoming_birthdays]

    def index
      action = params[:filter].presence_in(visiblity_list) || 'active'
      @users = User.includes(:tags).order(Arel.sql('contract_name::bytea ASC')).filter_by(action.to_sym)
      @users = @users.order(:last_name) if params.key?(:staff)
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

    def incoming_birthdays
      @users = incoming_birthday_users

      if @users.length < 3
        limit = 3 - @users.length
        missing_users = missing_users(limit)
        @users += missing_users
      end

      respond_with @users
    end

    def positions
      tags = Tag.order(:name).pluck(:name)
      render json: tags
    end

    private

    def visiblity_list
      %w[active inactive all]
    end

    def authenticate_notself
      authenticate_admin! unless current_user.id == params[:id].to_i
    end

    def incoming_birthday_users
      @users = User.where("#{Time.current.year} || TO_CHAR(birthdate, '/mm/dd') > ?", Time.current.to_date)
                   .order(Arel.sql("TO_CHAR(birthdate, 'mm/dd')"))
                   .select("id, TO_CHAR(birthdate, 'dd/mm/') || #{Time.current.year} birthday_date,"\
                           "CONCAT(last_name, ' ', first_name) AS full_name").limit(3)
    end

    def missing_users(limit)
      User.where("#{(Time.current + 1.year).year} || TO_CHAR(birthdate, '/mm/dd') > ?",
                 Time.current.to_date).order(Arel.sql("TO_CHAR(birthdate, 'mm/dd')"))
          .select("id, TO_CHAR(birthdate, 'dd/mm/') || #{(Time.current + 1.year).year} birthday_date,"\
                  "CONCAT(last_name, ' ', first_name) AS full_name").limit(limit)
    end
  end
end
