class AddIntegrationPayloadRefreshStatusToProjectReports < ActiveRecord::Migration[6.0]
  def change
    add_column :project_reports, :refresh_status, :string, null: false, default: 'fresh'
    add_column :project_reports, :refreshed_at, :datetime
  end
end
