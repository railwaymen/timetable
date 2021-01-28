# frozen_string_literal: true

json.array! @companies do |company|
  json.extract! company, :id, :name
  json.lenders company.lenders do |lender|
    json.id lender.id
    json.company_id lender.company_id
    json.full_name lender.to_s
  end
end
