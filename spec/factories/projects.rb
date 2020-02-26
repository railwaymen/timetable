# frozen_string_literal: true

FactoryBot.define do
  factory :project do
    sequence(:name) { |n| "Test #{n}" }
  end
end
