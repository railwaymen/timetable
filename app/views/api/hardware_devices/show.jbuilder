# frozen_string_literal: true

json.partial! 'hardware_device', locals: { device: @device }
json.images do
  json.array! @device.images do |image|
    json.id image.id
    json.record_id image.record_id
    if image.content_type.end_with?('heic', 'heif')
      json.source rails_representation_path(image.variant({}))
    else
      json.source rails_blob_path(image)
    end
  end
end
