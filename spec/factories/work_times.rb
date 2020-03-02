# frozen_string_literal: true

FactoryGirl.define do
  factory :work_time do
    user
    project
    body 'Test'
    sequence(:starts_at) { |n| Time.zone.now.beginning_of_day + (15 * n).minutes }
    sequence(:ends_at) { starts_at + 15.minutes }
    creator { user }
  end
end
