class CreateProjectReports < ActiveRecord::Migration[5.1]
  def change
    create_table :project_reports do |t|
      t.belongs_to :project, foreign_key: true, null: false
      t.jsonb :initial_body, null: false
      t.jsonb :last_body, null: false
      t.string :state, null: false, default: 'selecting_roles'
      t.integer :duration_sum, null: false
      t.datetime :range_start, null: false
      t.datetime :range_end, null: false

      t.timestamps
    end
  end
end
