# frozen_string_literal: true

json.id device.id
json.category device.category
json.brand device.brand
json.model device.model
json.serial_number device.serial_number
json.year_of_production device.year_of_production
json.year_bought device.year_bought
json.used_since device.used_since
json.cpu device.cpu
json.ram device.ram
json.user_id device.user_id
json.category device.category
json.storage device.storage
json.os_version device.os_version
json.state device.state
json.note device.note
json.user device.user
json.images do
  json.array! device.images do |image|
    json.id image.id
    json.record_id image.record_id
    json.source rails_blob_path(image, disposition: 'attachment')
  end
end
