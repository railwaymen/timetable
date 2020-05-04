# frozen_string_literal: true

FactoryBot.define do
  factory :remote_work do
    user
    creator { user }
    starts_at do
      Time.zone.today.workday? ? Time.zone.now.beginning_of_day + 9.hours : 1.business_day.from_now.beginning_of_day + 9.hours
    end
    ends_at { starts_at.beginning_of_day + 17.hours }
  end
end
