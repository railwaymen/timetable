# frozen_string_literal: true

Holidays.between(Date.civil(2015, 12, 9), 2.years.from_now, :pl).each do |holiday|
  BusinessTime::Config.holidays << holiday[:date]
end
