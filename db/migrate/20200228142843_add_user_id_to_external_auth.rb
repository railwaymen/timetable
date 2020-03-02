class AddUserIdToExternalAuth < ActiveRecord::Migration[5.1]
  def change
    add_reference :external_auths, :user, foreign_key: true
    change_column_null :external_auths, :project_id, true
  end
end
