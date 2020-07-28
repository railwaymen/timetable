# frozen_string_literal: true

json.id @vacation['id']
json.user_id @vacation['user_id']
json.full_name @vacation['full_name']
json.start_date @vacation['start_date']
json.end_date @vacation['end_date']
json.vacation_type @vacation['vacation_type']
json.vacation_sub_type @vacation['vacation_sub_type']
json.status @vacation['status']
json.description @vacation['description'] if current_user.admin? || current_user.staff_manager?
json.self_declined @vacation['self_declined']

json.approvers @vacation['approvers']
json.decliners @vacation['decliners']
json.interacted @vacation['interacted']
json.available_vacation_days @available_vacation_days
