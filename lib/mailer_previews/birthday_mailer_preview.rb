# frozen_string_literal: true

class BirthdayMailerPreview < ActionMailer::Preview
  def send_birthday_email
    user = User.first!
    email_template = BirthdayEmailTemplate.find_by(id: params[:birthday_email_template_id]) || BirthdayEmailTemplate.first!
    email_header = email_template.header.gsub(/{{username}}/, user.name)
    email_body = email_template.body.gsub(/{{username}}/, user.name)
    email_title = email_template.title.gsub(/{{username}}/, user.name)
    email_bottom = email_template.bottom.gsub(/{{username}}/, user.name)

    BirthdayMailer.with(title: email_title, header: email_header, body: email_body, bottom: email_bottom).send_birthday_email
  end
end
