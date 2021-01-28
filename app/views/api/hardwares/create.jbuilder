# frozen_string_literal: true

json.extract! @hardware, :id, :type, :user_id, :manufacturer, :model, :serial_number, :status, :physical_condition, :functional_condition, :locked
json.user_name @hardware&.user&.name if current_user.admin? || current_user.hardware_manager?
