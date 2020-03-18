# frozen_string_literal: true

FactoryBot.define do
  factory :project do
    sequence(:name) { |n| "Test #{n}" }

    trait :with_leader do
      association :leader, factory: :user
    end
  end
end
