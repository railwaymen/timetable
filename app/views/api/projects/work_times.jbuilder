# frozen_string_literal: true

json.project do
  json.partial! 'project', project: @project, as: :project
end
json.work_times @work_times, partial: 'work_time', as: :work_time
json.reports do
  json.array! @report do |user_record|
    json.project_id user_record.project_id
    json.project_name user_record.project_name
    json.project_duration user_record.project_duration
    json.user_id user_record.user_id
    json.duration user_record.duration
    json.user_name user_record.user_name
  end
end

json.tag_reports do
  json.array! @tag_report
end
