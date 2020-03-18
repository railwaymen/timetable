# frozen_string_literal: true

FactoryBot.define do
  factory :remote_work do
    user
    creator { user }
    sequence(:starts_at) { |n| Time.zone.now.beginning_of_day + (15 * n).minutes }
    sequence(:ends_at) { starts_at + 15.minutes }
  end
end
