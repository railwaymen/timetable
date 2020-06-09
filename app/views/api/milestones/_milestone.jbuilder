# frozen_string_literal: true

json.extract! milestone, :id, :external_id, :name, :closed, :starts_on, :ends_on, :project_id, :dev_estimate,
              :qa_estimate, :ux_estimate, :pm_estimate, :other_estimate, :external_estimate, :total_estimate
json.current milestone == @project.current_milestone
