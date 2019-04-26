# frozen_string_literal: true

class AddTagToWorkTimes < ActiveRecord::Migration[5.1]
  def change
    add_column :work_times, :tag, :string, index: true,
               default: 'dev', null: false
  end
end
