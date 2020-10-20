# frozen_string_literal: true

json.array! @hardwares do |hardware|
  json.extract! hardware, :id, :type, :user_id, :manufacturer, :model, :serial_number, :locked
  json.user_name hardware&.user&.name if current_user.admin? || current_user.hardware_manager?
  json.fields hardware.hardware_fields do |field|
    json.name field.name
    json.value field.value
    json.id field.id
  end
end
