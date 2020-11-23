# frozen_string_literal: true

FactoryBot.define do
  factory :work_time do
    user
    project
    tag
    body { 'Test' }
    sequence(:starts_at) { |n| Time.zone.now.beginning_of_day + (15 * n).minutes }
    sequence(:ends_at) { starts_at + 15.minutes }
    creator { user }
    department { user.department }

    trait :with_jira_url do
      sequence(:task) { |n| "https://example.com/XX-#{n}" }
      sequence(:integration_payload) do |n|
        {
          'Jira' => {
            'task_id' => "XX-#{n}"
          }
        }
      end
    end
  end
end
