# frozen_string_literal: true

json.array! @hardwares do |hardware|
  json.id hardware.id
  json.type hardware.type
  json.manufacturer hardware.manufacturer
  json.model hardware.model
  json.serial_number hardware.serial_number
  json.user_name hardware.user.name if current_user.hardware_manager?
  json.locked hardware.locked
  json.fields hardware.hardware_fields do |field|
    json.name field.name
    json.value field.value
    json.id field.id
  end
end
