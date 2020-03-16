# frozen_string_literal: true

class BirthdayMailerPreview < ActionMailer::Preview
  def send_birthday_email
    username = User.first!.to_s
    email_template = BirthdayEmailTemplate.find_by(id: params[:birthday_email_template_id]) || BirthdayEmailTemplate.first!
    email_header = email_template.header.gsub(/{{username}}/, username)
    email_body = email_template.body.gsub(/{{username}}/, username)
    email_title = email_template.title.gsub(/{{username}}/, username)
    email_bottom = email_template.bottom.gsub(/{{username}}/, username)

    BirthdayMailer.with(title: email_title, header: email_header, body: email_body, bottom: email_bottom).send_birthday_email
  end
end
