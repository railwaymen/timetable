# frozen_string_literal: true

class UpdateTagInWorkTimes < ActiveRecord::Migration[5.1]
  def change
    WorkTime.where(tag: 'ui').update_all(tag: 'im')
  end
end
