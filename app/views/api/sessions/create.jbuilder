# frozen_string_literal: true

json.extract! @user, :id, :first_name, :last_name
json.is_leader @user.leader?
json.admin @user.admin?
json.manager @user.manager?
json.staff_manager @user.staff_manager?
json.token @token
