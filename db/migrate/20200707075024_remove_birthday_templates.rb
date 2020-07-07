class RemoveBirthdayTemplates < ActiveRecord::Migration[6.0]
  def change
    drop_table :birthday_email_templates
    remove_column :users, :birthdate
  end
end
