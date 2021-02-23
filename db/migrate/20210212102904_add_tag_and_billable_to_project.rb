class AddTagAndBillableToProject < ActiveRecord::Migration[6.0]
  def change
    add_column :projects, :tag, :string
    add_column :projects, :billable, :boolean, null: false, default: false
  end
end
