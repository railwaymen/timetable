# frozen_string_literal: true

class SendBirthdayEmailWorker
  include Sidekiq::Worker

  def perform(username, email_template_id)
    email_template = BirthdayEmailTemplate.find(email_template_id)
    email_header = email_template.header.gsub(/{{username}}/, username)
    email_body = email_template.body.gsub(/{{username}}/, username)
    email_title = email_template.title.gsub(/{{username}}/, username)
    email_bottom = email_template.bottom.gsub(/{{username}}/, username)

    BirthdayMailer.with(title: email_title, header: email_header, body: email_body, bottom: email_bottom).send_birthday_email.deliver_later
  end
end
