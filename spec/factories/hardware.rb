# frozen_string_literal: true

FactoryBot.define do
  factory :hardware do
    user
    type { 'laptop' }
    manufacturer { 'Apple' }
    model { 'Macbook 13 PRO' }
    sequence(:serial_number) { |n| "XXX#{n}" }
    physical_condition { 'good' }
    functional_condition { 'good' }
  end
end
