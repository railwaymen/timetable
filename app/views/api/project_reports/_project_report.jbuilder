# frozen_string_literal: true

json.extract! project_report, :id, :initial_body, :last_body, :state, :starts_at, :ends_at, :duration_sum
json.project_name project_report.project.name
json.roles project_report.project_report_roles.includes(:user).each_with_object({}) { |role, mem| mem["#{role.user.first_name} #{role.user.last_name}"] = { role: role.role, hourly_wage: role.hourly_wage } }
