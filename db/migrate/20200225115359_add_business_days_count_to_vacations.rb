class AddBusinessDaysCountToVacations < ActiveRecord::Migration[5.1]
  def change
    add_column :vacations, :business_days_count, :integer
    Vacation.find_each do |vacation|
      vacation.update_column :business_days_count, vacation.start_date.business_days_until(vacation.end_date + 1.day)
    end
    change_column_null :vacations, :business_days_count, false
  end
end
