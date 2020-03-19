# frozen_string_literal: true

namespace :tasks do
  desc 'Sends email to @all when user have birthday that day'
  task send_birthday_email: :environment do
    current_date = Time.current.to_date.strftime('%d/%m')
    birthday_users = User.where("TO_CHAR(birthdate, 'dd/mm') = ?", current_date)
    last_used = BirthdayEmailTemplate.find_by(last_used: true) || BirthdayEmailTemplate.first
    if last_used && birthday_users.any?
      birthday_users.find_each do |birthday_user|
        last_used&.update(last_used: false)
        email_template = last_used.next || BirthdayEmailTemplate.first
        email_template.update(last_used: true)
        username = [birthday_user.first_name, birthday_user.last_name].join(' ')
        SendBirthdayEmailWorker.perform_async(username, email_template.id)
        last_used = email_template
      end
    end
  end
end
