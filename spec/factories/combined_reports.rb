# frozen_string_literal: true

FactoryBot.define do
  factory :combined_report do
    project
    name { 'Combined report' }
    duration_sum { 10 }
    cost { 100 }
    starts_at { 10.days.ago.beginning_of_day }
    ends_at { 3.days.ago.end_of_day }
    currency { 'PLN' }
  end
end
