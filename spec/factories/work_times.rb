FactoryGirl.define do
  factory :work_time do
    user
    project
    body 'Test'
    starts_at { Time.current }
    ends_at { 2.hours.from_now }
    creator { user }
  end
end
