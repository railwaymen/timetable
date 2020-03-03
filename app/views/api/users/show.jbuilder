# frozen_string_literal: true

json.call @user, :id, :first_name, :last_name, :email, :lang, :active, :next_id, :prev_id
if current_user.admin?
  json.phone @user.phone
  json.contract_name @user.contract_name
  json.birthdate @user.birthdate
end
json.external_auth @user.external_auth, :id, :provider if @user.external_auth
