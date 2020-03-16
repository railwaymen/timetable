class AddBottomToBirthdayEmailTemplates < ActiveRecord::Migration[5.1]
  def change
    add_column :birthday_email_templates, :bottom, :text
    add_column :birthday_email_templates, :header, :text

    BirthdayEmailTemplate.update_all(bottom: '', header: '')
    change_column_null :birthday_email_templates, :header, false
    change_column_null :birthday_email_templates, :bottom, false

    change_column_default :birthday_email_templates, :header, ''
    change_column_default :birthday_email_templates, :body, ''
    change_column_default :birthday_email_templates, :bottom, ''
  end
end
