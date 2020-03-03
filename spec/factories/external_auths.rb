# frozen_string_literal: true

FactoryBot.define do
  factory :external_auth do
    user
    provider { 'jira' }
    data { {} }
  end
end
