# frozen_string_literal: true

FactoryBot.define do
  factory :project_resource_assignment do
    project_resource
    project
    user
    sequence(:resource_rid) { |n| "test-rid-#{n}" }
    starts_at { Time.current.beginning_of_day }
    ends_at { Time.current.end_of_day + 1.day }
  end
end
