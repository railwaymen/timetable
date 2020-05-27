# frozen_string_literal: true

json.extract! user, :id, :first_name, :last_name, :email, :name, :accounting_name, :lang, :department
json.active user.kept?
json.position_list user.tags.pluck(:name)
json.extract! user, :phone, :contract_name, :birthdate if current_user.try(:admin?)
