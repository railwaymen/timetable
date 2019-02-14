class AddIntegrationPayloadToWorkTime < ActiveRecord::Migration[5.1]
  def change
    add_column :work_times, :integration_payload, :jsonb
  end
end
