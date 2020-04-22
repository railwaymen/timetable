# frozen_string_literal: true

FactoryBot.define do
  factory :combined_reports_project_report do
    project_report
    combined_report
  end
end
