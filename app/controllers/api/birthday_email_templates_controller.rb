# frozen_string_literal: true

module Api
  class BirthdayEmailTemplatesController < Api::BaseController
    before_action :authenticate_admin!
    before_action :find_birthday, only: %i[show update destroy]

    def index
      @birthday_email_templates = BirthdayEmailTemplate.all.order(:created_at)
      respond_with @birthday_email_templates
    end

    def show
      @birthday_email_template = BirthdayEmailTemplate.find(params[:id])
      respond_with @birthday_email_template
    end

    def create
      @birthday_email_template = BirthdayEmailTemplate.create(birthday_email_template_params)
      respond_with :api, @birthday_email_template
    end

    def update
      @birthday_email_template.update(birthday_email_template_params)
      respond_with @birthday_email_template
    end

    def destroy
      @birthday_email_template.destroy
      respond_with @birthday_email_template
    end

    def set_last_used
      birthday_email_template = BirthdayEmailTemplate.find(params[:birthday_email_template_id])
      birthday_email_template.set_last_used
      respond_with birthday_email_template
    end

    private

    def birthday_email_template_params
      params.fetch(:birthday_email_template).permit(:name, :body, :bottom, :header, :title, :last_used)
    end

    def find_birthday
      @birthday_email_template = BirthdayEmailTemplate.find(params[:id])
    end
  end
end
