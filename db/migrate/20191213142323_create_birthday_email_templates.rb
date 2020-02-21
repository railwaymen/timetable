class CreateBirthdayEmailTemplates < ActiveRecord::Migration[5.1]
  def change
    create_table :birthday_email_templates do |t|
      t.text :body, null: false
      t.string :name, null: false
      t.string :title, null: false
      t.boolean :last_used, null: false, default: false
      
      t.timestamps
    end
  end
end
