class AddSelfDeclinedToVacations < ActiveRecord::Migration[5.1]
  def change
    add_column :vacations, :self_declined, :boolean, null: false, default: false
  end
end
