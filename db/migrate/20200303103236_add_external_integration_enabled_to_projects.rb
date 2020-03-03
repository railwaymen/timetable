class AddExternalIntegrationEnabledToProjects < ActiveRecord::Migration[5.1]
  def change
    add_column :projects, :external_integration_enabled, :boolean, null: false, default: false
  end
end
