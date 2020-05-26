class AddExternalPayloadToProjects < ActiveRecord::Migration[6.0]
  def change
    add_column :projects, :external_payload, :jsonb, null: false, default: {}
  end
end
