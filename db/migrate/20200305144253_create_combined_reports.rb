class CreateCombinedReports < ActiveRecord::Migration[6.0]
  def change
    create_table :combined_reports do |t|
      t.string :name, null: false, default: ''
      t.string :state, null: false, default: ''
      t.references :project, foreign_key: true
      t.datetime :discarded_at, index: true

      t.timestamps
    end
  end
end
