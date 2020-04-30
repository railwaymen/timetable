# frozen_string_literal: true

FactoryBot.define do
  factory :hardware_field do
    hardware
    name { 'Field' }
    value { 'Value' }
  end
end
