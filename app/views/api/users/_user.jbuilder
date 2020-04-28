# frozen_string_literal: true

json.extract! user, :id, :first_name, :last_name, :email, :name, :accounting_name, :lang
json.active user.kept?
json.extract! user, :phone, :contract_name, :birthdate, :position_list if current_user.try(:admin?)
