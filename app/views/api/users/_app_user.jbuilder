# frozen_string_literal: true

json.extract! current_user, :id, :first_name, :last_name, :name, :accounting_name, :lang
json.projects current_user.project_ids
json.is_leader current_user.leader?
json.admin current_user.admin?
json.hardware_manager current_user.hardware_manager?
json.manager current_user.manager?
json.staff_manager current_user.staff_manager
