class RemoveContractNameFromWorkTimes < ActiveRecord::Migration[6.0]
  def up
    remove_column :work_times, :_contract_name
  end

  def down
    add_column :work_times, :_contract_name, :string
  end
end
