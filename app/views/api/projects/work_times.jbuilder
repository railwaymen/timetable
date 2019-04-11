# frozen_string_literal: true

json.project do
  json.partial! 'project', project: @project, as: :project
end
json.work_times @work_times, partial: 'work_time', as: :work_time
