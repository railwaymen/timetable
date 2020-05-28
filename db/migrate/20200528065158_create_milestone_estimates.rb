class CreateMilestoneEstimates < ActiveRecord::Migration[6.0]
  def change
    create_table :milestone_estimates do |t|
      t.references :milestone, null: false, foreign_key: true
      t.integer :dev_estimate, null: false
      t.integer :dev_estimate_diff, null: false, default: 0
      t.integer :qa_estimate, null: false
      t.integer :qa_estimate_diff, null: false, default: 0
      t.integer :ux_estimate, null: false
      t.integer :ux_estimate_diff, null: false, default: 0
      t.integer :pm_estimate, null: false
      t.integer :pm_estimate_diff, null: false, default: 0
      t.integer :external_estimate, null: false
      t.integer :external_estimate_diff, null: false, default: 0
      t.integer :other_estimate, null: false
      t.integer :other_estimate_diff, null: false, default: 0
      t.integer :total_estimate, null: false
      t.integer :total_estimate_diff, null: false, default: 0

      t.text :note
      t.timestamps
    end
  end
end
