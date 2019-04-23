# frozen_string_literal: true

FactoryGirl.define do
  factory :project_report do
    project
    initial_body(qa: [])
    last_body(qa: [])
    range_start { 10.days.ago.beginning_of_day }
    range_end { 3.days.ago.end_of_day }
    duration_sum 0
  end
end