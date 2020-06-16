class AddDepartmentEstimatesToMilestones < ActiveRecord::Migration[6.0]
  def change
    rename_column :milestones, :estimate, :total_estimate
    add_column :milestones, :dev_estimate, :integer, null: false, default: 0
    add_column :milestones, :qa_estimate, :integer, null: false, default: 0
    add_column :milestones, :ux_estimate, :integer, null: false, default: 0
    add_column :milestones, :pm_estimate, :integer, null: false, default: 0
    add_column :milestones, :external_estimate, :integer, null: false, default: 0
    add_column :milestones, :other_estimate, :integer, null: false, default: 0

    change_column_null :milestones, :total_estimate, false
    change_column_default :milestones, :total_estimate, 0
  end
end
