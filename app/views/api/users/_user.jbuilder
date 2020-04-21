# frozen_string_literal: true

json.extract! user, :id, :first_name, :last_name, :email, :name, :accounting_name, :lang
json.active user.kept?
json.phone user.phone if current_user.try(:admin?)
json.contract_name user.contract_name if current_user.try(:admin?)
json.birthdate user.birthdate if current_user.try(:admin?)
