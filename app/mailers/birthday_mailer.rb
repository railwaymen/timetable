# frozen_string_literal: true

class BirthdayMailer < ApplicationMailer
  def send_birthday_email
    mail(to: Rails.application.secrets[:birthday_mailer_to], subject: params[:title], content_type: 'text/html') do |format|
      format.html { render 'send_birthday_email', locals: { body: params[:body], header: params[:header], bottom: params[:bottom] } }
    end
  end
end
