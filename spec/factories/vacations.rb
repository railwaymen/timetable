# frozen_string_literal: true

FactoryGirl.define do
  factory :vacation do
    user
    start_date { Time.current.beginning_of_day.to_date }
    end_date { Time.current.beginning_of_day.to_date + 1.day }
    business_days_count { rand(10) }
    vacation_type 'planned'
  end
end
