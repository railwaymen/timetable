# frozen_string_literal: true

FactoryBot.define do
  factory :hardware_device do
    category { 'computers' }
    brand { 'BrandA' }
    model { 'Modelc' }
    sequence(:serial_number) { |n| "SMSRLNMBR-#{n}" }
    year_of_production { '2021-02-22' }
    year_bought { '2021-02-22' }
    used_since { '2021-02-22' }
    state { 'poor' }
    os_version { '10.0.0' }
    device_type { 'Type1' }
    price { 1000 }
    user { nil }
  end
end
