# frozen_string_literal: true

FactoryBot.define do
  factory :project_report_role do
    project_report
    user
    role { 'dev' }
    description { 'Frontend' }
  end
end
