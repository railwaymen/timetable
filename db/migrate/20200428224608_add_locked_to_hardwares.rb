# frozen_string_literal: true

class AddLockedToHardwares < ActiveRecord::Migration[6.0]
  def change
    add_column :hardwares, :locked, :boolean, null: false, default: false
  end
end
