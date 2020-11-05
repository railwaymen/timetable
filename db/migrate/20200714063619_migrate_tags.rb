class MigrateTags < ActiveRecord::Migration[6.0]
  class WorkTime < ApplicationRecord
  end
  
  def change
    dev = Tag.where(name: 'dev').first_or_create! use_as_default: true
    im = Tag.where(name: 'internal meeting').first_or_create!
    cc = Tag.where(name: 'client call').first_or_create!
    res = Tag.where(name: 'research').first_or_create!

    WorkTime.where(tag: 'dev').update_all(tag_id: dev.id)
    WorkTime.where(tag: 'im').update_all(tag_id: im.id)
    WorkTime.where(tag: 'cc').update_all(tag_id: cc.id)
    WorkTime.where(tag: 'res').update_all(tag_id: res.id)

    rename_column :work_times, :tag, :_tag
  end
end
