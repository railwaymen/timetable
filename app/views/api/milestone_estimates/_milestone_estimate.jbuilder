# frozen_string_literal: true

json.extract! milestone_estimate, :id, :created_at, :note, :dev_estimate, :dev_estimate_diff, :qa_estimate, :qa_estimate_diff,
              :ux_estimate, :ux_estimate_diff, :pm_estimate, :pm_estimate_diff, :other_estimate, :other_estimate_diff,
              :external_estimate, :external_estimate_diff, :total_estimate, :total_estimate_diff
