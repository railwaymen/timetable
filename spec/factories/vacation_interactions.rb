# frozen_string_literal: true

FactoryBot.define do
  factory :vacation_interaction do
    vacation
    user
    action { 'approved' }
  end
end
