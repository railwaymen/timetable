# frozen_string_literal: true

json.id @vacation['id']
json.full_name @vacation['full_name']
json.start_date @vacation['start_date']
json.end_date @vacation['end_date']
json.vacation_type @vacation['vacation_type']
json.vacation_sub_type @vacation['vacation_sub_type']
json.status @vacation['status']
json.description @vacation['description']

json.approvers @vacation['approvers']
json.decliners @vacation['decliners']
json.interacted @vacation['interacted']
json.available_vacation_days @available_vacation_days
