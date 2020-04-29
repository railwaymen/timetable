# frozen_string_literal: true

json.call @user, :id, :first_name, :last_name, :email, :name, :accounting_name, :lang, :next_id, :prev_id
json.active @user.kept?
if current_user.try(:admin?)
  json.extract! @user, :phone, :contract_name, :birthdate
  json.position_list @user.tags.pluck(:name)
end
json.external_auth @user.external_auth, :id, :provider if @user.external_auth
