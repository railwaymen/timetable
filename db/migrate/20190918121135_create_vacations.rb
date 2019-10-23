class CreateVacations < ActiveRecord::Migration[5.1]
  def change
    create_table :vacations do |t|
      t.belongs_to :user, foreign_key: true, null: false
      t.date :start_date, null: false
      t.date :end_date, null: false
      t.string :vacation_type, null: false
      t.string :description
      t.string :status, null: false, default: 'unconfirmed'
      t.string :vacation_sub_type
      
      t.timestamps
    end
  end
end
