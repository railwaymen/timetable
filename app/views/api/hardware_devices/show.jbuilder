# frozen_string_literal: true

json.partial! 'hardware_device', locals: { device: @device }
json.images do
  json.array! @device.images do |image|
    json.id image.id
    json.record_id image.record_id
    json.source rails_blob_path(image, disposition: 'attachment')
  end
end
