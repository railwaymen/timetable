# frozen_string_literal: true

FactoryBot.define do
  factory :lender do
    company
    first_name { 'John' }
    last_name { 'Johnson' }
  end
end