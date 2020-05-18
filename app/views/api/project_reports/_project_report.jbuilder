# frozen_string_literal: true

json.extract! project_report, :id, :initial_body, :last_body, :state, :starts_at, :ends_at, :duration_sum, :currency,
              :name, :refresh_status, :refreshed_at
json.generated project_report.generated?
json.project_name project_report.project.name
json.roles project_report.project_report_roles.each_with_object({}) { |role, mem| mem[role.user_id] = { role: role.role, hourly_wage: role.hourly_wage } }
