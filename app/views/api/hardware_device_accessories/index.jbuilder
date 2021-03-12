# frozen_string_literal: true

json.array! @accessories do |accessory|
  json.partial! 'hardware_device_accessory', locals: { accessory: accessory }
end
