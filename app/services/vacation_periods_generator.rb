# frozen_string_literal: true

class VacationPeriodsGenerator
  def generate
    User.active.find_each do |user|
      next unless need_new_period(user)

      VacationPeriod.create(user_id: user.id, starts_at: Time.current.beginning_of_year, ends_at: Time.current.end_of_year, vacation_days: 26)
    end
  end

  def need_new_period(user)
    last_period = user.vacation_periods.last
    return true if last_period.nil?

    last_period.starts_at == Time.current.beginning_of_year.to_date && last_period.ends_at == Time.current.end_of_year.to_date ? false : true
  end
end
