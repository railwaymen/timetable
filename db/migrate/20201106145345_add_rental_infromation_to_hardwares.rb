class AddRentalInfromationToHardwares < ActiveRecord::Migration[6.0]
  def change
    add_column :hardwares, :status, :string, null: false, default: 'in_office'
    add_column :hardwares, :physical_condition, :string
    add_column :hardwares, :functional_condition, :string

    Hardware.all.update_all(physical_condition: '', functional_condition: '')

    change_column_null :hardwares, :physical_condition, false
    change_column_null :hardwares, :functional_condition, false
  end
end
