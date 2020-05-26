# frozen_string_literal: true

FactoryBot.define do
  factory :project do
    sequence(:name) { |n| "Test #{n}" }

    trait :with_leader do
      association :leader, factory: :user
    end

    trait :vacation do
      name { 'Vacation' }
    end

    trait :zks do
      name { 'ZKS' }
    end

    trait :discarded do
      discarded_at { Time.zone.now }
    end

    trait :external_integration_enabled do
      external_integration_enabled { true }
      external_id { 1 }
    end
  end
end
