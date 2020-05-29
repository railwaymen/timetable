# frozen_string_literal: true

FactoryBot.define do
  factory :milestone do
    project
    sequence(:name) { |n| "Name#{n}" }
    sequence(:position)
  end
end
