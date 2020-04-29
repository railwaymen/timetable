# frozen_string_literal: true

json.extract! user, :id, :first_name, :last_name, :email, :name, :accounting_name, :lang
json.active user.kept?
if current_user.try(:admin?)
  json.extract! user, :phone, :contract_name, :birthdate
  json.position_list user.tags.pluck(:name)
end
