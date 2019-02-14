# frozen_string_literal: true

FactoryGirl.define do
  factory :external_auth do
    project
    provider { 'jira' }
    data { {} }
  end
end
