class RenameWorkTimeContractName < ActiveRecord::Migration[6.0]
  def change
    rename_column :work_times, :contract_name, :_contract_name
  end
end
