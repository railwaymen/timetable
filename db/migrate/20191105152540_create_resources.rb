class CreateResources < ActiveRecord::Migration[5.1]
  def up
    class Resource < ApplicationRecord
    end

    create_table :resources do |t|
      t.belongs_to :user, foreign_key: true
      t.integer :resource_id, foreign_key: true
      t.string :rid, null: false
      t.string :name, null: false
      t.boolean :group_only, default: false, null: false
      t.string :parent_rid

      t.timestamps
    end

    Resource.create(rid: 'front', name: 'Frontend', group_only: true)
    Resource.create(rid: 'back', name: 'Backend', group_only: true)
    Resource.create(rid: 'qa', name: 'QA', group_only: true)
    Resource.create(rid: 'android', name: 'Android', group_only: true)
    Resource.create(rid: 'iOS', name: 'iOS', group_only: true)
  end

  def down
    drop_table :resources
  end
end
