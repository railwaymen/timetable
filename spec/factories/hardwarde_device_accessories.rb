# frozen_string_literal: true

FactoryBot.define do
  factory :hardware_device_accessory do
    name { 'MyString' }
    quantity { 1 }
    hardware_device { nil }
  end
end
