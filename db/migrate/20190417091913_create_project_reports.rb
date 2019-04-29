class CreateProjectReports < ActiveRecord::Migration[5.1]
  def change
    create_table :project_reports do |t|
      t.belongs_to :project, foreign_key: true, null: false
      t.jsonb :initial_body, null: false, default: {}
      t.jsonb :last_body, null: false, default: {}
      t.string :state, null: false, default: 'editing'
      t.integer :duration_sum, null: false
      t.decimal :cost, precision: 12, scale: 2, default: 0, null: false
      t.datetime :starts_at, null: false
      t.datetime :ends_at, null: false
      t.string :currency, null: false, default: ''

      t.timestamps
    end
  end
end
