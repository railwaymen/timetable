# frozen_string_literal: true

FactoryBot.define do
  factory :hardware_accessory do
    hardware
    name { 'Accessory' }
  end
end
