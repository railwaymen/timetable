# frozen_string_literal: true

json.incoming_birthdays @users do |user|
  json.id user.id
  json.user_full_name user.full_name
  json.birthday_date user.birthday_date
end
