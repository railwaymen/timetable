# frozen_string_literal: true

FactoryGirl.define do
  factory :project_report_role do
    project_report nil
    user nil
    role 'MyString'
  end
end
