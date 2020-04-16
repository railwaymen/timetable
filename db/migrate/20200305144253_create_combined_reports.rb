class CreateCombinedReports < ActiveRecord::Migration[6.0]
  def change
    create_table :combined_reports do |t|
      t.string :name, null: false, default: ''
      t.references :project, foreign_key: true
      t.datetime :discarded_at, index: true
      t.integer :duration_sum, null: false
      t.decimal :cost, precision: 12, scale: 2, null: false
      t.datetime :starts_at, null: false
      t.datetime :ends_at, null: false
      t.string :currency, null: false
      t.string :file_path

      t.timestamps
    end
  end
end
