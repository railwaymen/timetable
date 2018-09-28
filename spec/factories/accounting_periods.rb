FactoryGirl.define do
  factory :accounting_period do
    user
    duration 160.hours
    position { rand(1..100_000) }
  end
end
