class AddAccountingFieldToProjects < ActiveRecord::Migration[6.0]
  def change
    add_column :projects, :vacation, :boolean, null: false, default: false
    Project.where(name: 'Vacation').update_all(vacation: true)

    add_column :projects, :booked, :boolean, null: false, default: false
    Project.where(name: 'ZKS').update_all(booked: true)

  end
end
