# frozen_string_literal: true

FactoryBot.define do
  factory :tag do
    sequence(:name) { |n| "Tag #{n}" }

    trait :with_project do
      association :project, factory: :project
    end

    trait :discarded do
      discarded_at { Time.zone.now }
    end

    trait :default do
      use_as_default { true }
    end
  end
end
