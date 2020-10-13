json.array! @milestones do |milestone|
  json.extract! milestone, :id, :external_id, :name, :closed, :starts_on, :ends_on,
                           :project_id, :work_times_duration, :dev_estimate, :qa_estimate,
                           :ux_estimate, :pm_estimate, :other_estimate, :external_estimate,
                           :total_estimate
end
