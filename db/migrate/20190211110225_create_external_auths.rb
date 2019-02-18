class CreateExternalAuths < ActiveRecord::Migration[5.1]
  def change
    create_table :external_auths do |t|
      t.belongs_to :project, foreign_key: true, null: false
      t.jsonb :data, null: false
      t.string :provider, null: false

      t.timestamps
    end
  end
end
