# frozen_string_literal: true

class BirthdayMailer < ApplicationMailer
  def send_birthday_email(template_title, template_body)
    mail(to: Rails.application.secrets[:birthday_mailer_to], subject: template_title, content_type: 'text/html') do |format|
      format.html { render 'send_birthday_email', locals: { body: template_body } }
    end
  end
end
