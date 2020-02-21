# frozen_string_literal: true

FactoryBot.define do
  factory :vacation do
    user
    start_date { Time.current.beginning_of_day.to_date }
    end_date { Time.current.beginning_of_day.to_date + 1.day }
    vacation_type { 'planned' }
  end
end
