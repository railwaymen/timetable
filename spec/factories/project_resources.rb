# frozen_string_literal: true

FactoryBot.define do
  factory :project_resource do
    user
    sequence(:rid) { |n| "test-rid-#{n}" }
    name { 'John Test' }
  end
end
