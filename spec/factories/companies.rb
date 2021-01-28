# frozen_string_literal: true

FactoryBot.define do
  factory :company do
    sequence(:name) { |n| "Company #{n}" }
    address { 'Avenue Street 5' }
    zip_code { '54-124' }
    city { 'New York' }
    nip { '7342356745' }
    krs { '378238345' }
  end
end