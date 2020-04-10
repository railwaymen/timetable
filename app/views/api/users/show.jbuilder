# frozen_string_literal: true

json.call @user, :id, :first_name, :last_name, :email, :name, :accounting_name, :lang, :next_id, :prev_id
json.active @user.kept?
if current_user.admin?
  json.phone @user.phone
  json.contract_name @user.contract_name
  json.birthdate @user.birthdate
end
json.external_auth @user.external_auth, :id, :provider if @user.external_auth
