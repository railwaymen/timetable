# frozen_string_literal: true

json.array! @milestones do |milestone|
  json.partial! 'milestone', milestone: milestone
  json.work_times_duration milestone.work_times_duration if params[:with_estimates].present?
end
