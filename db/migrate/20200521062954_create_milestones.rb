class CreateMilestones < ActiveRecord::Migration[6.0]
  def change
    create_table :milestones do |t|
      t.references :project
      t.string :name
      t.text :note
      t.boolean :closed, null: false, default: false
      t.date :starts_on
      t.date :ends_on
      t.integer :estimate
      t.integer :position, null: false
      t.jsonb :integration_payload, null: false, default: {}
      t.timestamps
      t.index [:position, :project_id], unique: true
    end
  end
end
