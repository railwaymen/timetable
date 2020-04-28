# frozen_string_literal: true

json.call @user, :id, :first_name, :last_name, :email, :name, :accounting_name, :lang, :next_id, :prev_id
json.active @user.kept?
json.extract! @user, :phone, :contract_name, :birthdate, :position_list if current_user.try(:admin?)
json.external_auth @user.external_auth, :id, :provider if @user.external_auth
