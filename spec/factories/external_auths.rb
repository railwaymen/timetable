# frozen_string_literal: true

FactoryGirl.define do
  factory :external_auth do
    user
    provider { 'jira' }
    data { {} }
  end
end
