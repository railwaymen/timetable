class AddVisibleOnReportsToMilestones < ActiveRecord::Migration[6.0]
  def change
    add_column :milestones, :visible_on_reports, :boolean, null: false, default: false
  end
end
