class CreateVacationPeriods < ActiveRecord::Migration[5.1]
  def up
    create_table :vacation_periods do |t|
      t.belongs_to :user, foreign_key: true, null: false
      t.date :starts_at, null: false
      t.date :ends_at, null: false
      t.integer :vacation_days, null: false
      t.text :note, default: ''
      t.boolean :closed, default: false, null: false

      t.timestamps
    end

    User.active.find_each do |user|
      VacationPeriod.create!(user_id: user.id, starts_at: Time.current.beginning_of_year, ends_at: Time.current.end_of_year,
                             vacation_days: 26)
    end
  end

  def down
    drop_table :vacation_periods
  end
end
