# frozen_string_literal: true

json.records do
  json.array! @devices do |device|
    json.partial! 'hardware_device', locals: { device: device }
  end
end
json.total_pages @devices.total_pages
json.current_page @devices.current_page
