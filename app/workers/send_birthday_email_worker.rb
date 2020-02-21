# frozen_string_literal: true

class SendBirthdayEmailWorker
  include Sidekiq::Worker

  def perform(username, email_template_id)
    email_template = BirthdayEmailTemplate.find(email_template_id)
    email_body = email_template.body.gsub(/{{username}}/, username)
    email_title = email_template.title.gsub(/{{username}}/, username)
    BirthdayMailer.send_birthday_email(email_title, email_body).deliver_later
  end
end
