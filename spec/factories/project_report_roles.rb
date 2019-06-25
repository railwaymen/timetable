# frozen_string_literal: true

FactoryGirl.define do
  factory :project_report_role do
    project_report
    user
    role 'dev'
    description 'Frontent'
  end
end
