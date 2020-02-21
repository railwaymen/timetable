# frozen_string_literal: true

FactoryBot.define do
  factory :user do
    first_name { 'Tohn' }
    last_name { 'Test' }
    sequence(:email) { |n| "test#{n}@example.com" }
  end

  factory :admin, class: User do
    first_name { 'Admin' }
    last_name { 'Admin' }
    sequence(:email) { |n| "admin#{n}@example.com" }
    admin { true }
  end

  factory :manager, class: User do
    first_name { 'Manager' }
    last_name { 'Manager' }
    sequence(:email) { |n| "manager#{n}@example.com" }
    manager { true }
  end

  factory :staff_manager, class: User do
    first_name { 'Staff' }
    last_name { 'Manager' }
    sequence(:email) { |n| "staffmanager#{n}@example.com" }
    staff_manager { true }
  end
end
