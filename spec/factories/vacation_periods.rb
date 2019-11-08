# frozen_string_literal: true

FactoryGirl.define do
  factory :vacation_period do
    user
    starts_at Time.current.beginning_of_year
    ends_at Time.current.end_of_year
    vacation_days 26
  end
end
