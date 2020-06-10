# frozen_string_literal: true

FactoryBot.define do
  factory :user do
    sequence(:first_name) { |n| "John #{n}" }
    sequence(:last_name) { |n| "Smith #{n}" }
    sequence(:email) { |n| "test#{n}@example.com" }
    sequence(:password) { |n| "password#{n}" }
    department { 'dev' }

    trait :admin do
      admin { true }
    end

    trait :hardware_manager do
      hardware_manager { true }
    end

    trait :manager do
      manager { true }
    end

    trait :staff_manager do
      staff_manager { true }
    end

    trait :discarded do
      discarded_at { Time.zone.now }
    end

    trait :with_external_auth do
      external_auth
    end
  end
end
