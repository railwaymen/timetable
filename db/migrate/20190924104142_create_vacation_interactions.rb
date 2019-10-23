class CreateVacationInteractions < ActiveRecord::Migration[5.1]
  def change
    create_table :vacation_interactions do |t|
      t.belongs_to :vacation, foreign_key: true, null: false
      t.belongs_to :user, foreign_key: true, null: false
      t.string :action, null: false
      
      t.timestamps
    end
  end
end
