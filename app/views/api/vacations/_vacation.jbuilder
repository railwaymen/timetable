# frozen_string_literal: true

json.extract! vacation, :id, :start_date, :end_date, :vacation_type, :status, :business_days_count
json.full_name vacation.user.to_s
