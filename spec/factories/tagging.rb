# frozen_string_literal: true

FactoryBot.define do
  factory :tagging do
    tag
    association :taggable, factory: :user
  end
end
