class AddInvoiceToHardwareDevices < ActiveRecord::Migration[6.0]
  def change
    add_column :hardware_devices, :invoice, :string
  end
end
