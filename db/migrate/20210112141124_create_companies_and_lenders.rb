class CreateCompaniesAndLenders < ActiveRecord::Migration[6.0]
  def change
    create_table :companies do |t|
      t.string :name, null: false
      t.string :address, null: false
      t.string :zip_code, null: false
      t.string :city, null: false
      t.string :nip, null: false
      t.string :krs, null: false
      t.timestamps
    end

    create_table :lenders do |t|
      t.string :first_name, null: false
      t.string :last_name, null: false
      t.references :company, foreign_key: true
      t.timestamps
    end
  end
end
