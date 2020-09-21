class AddJiraIssuesToMilestones < ActiveRecord::Migration[6.0]
  def change
    add_column :milestones, :jira_issues, :string, array: true, default: [] 
  end
end
