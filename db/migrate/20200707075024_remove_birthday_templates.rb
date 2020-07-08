class RemoveBirthdayTemplates < ActiveRecord::Migration[6.0]
  def change
    drop_table :birthday_email_templates do |t|
      t.text :body, null: false
      t.string :name, null: false
      t.string :title, null: false
      t.boolean :last_used, null: false, default: false
      
      t.timestamps
    end
    remove_column :users, :birthdate, :date
  end
end
