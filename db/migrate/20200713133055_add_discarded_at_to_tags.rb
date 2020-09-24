class AddDiscardedAtToTags < ActiveRecord::Migration[6.0]
  def change
    add_column :tags, :discarded_at, :datetime                                                                                                                                            
    add_index :tags, :discarded_at
    add_column :tags, :use_as_default, :boolean, null: false, default: false
  end
end
