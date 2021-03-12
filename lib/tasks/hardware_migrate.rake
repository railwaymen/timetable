# frozen_string_literal: true

namespace :hardware do
  desc 'Move Hardware to HardwareDevices'
  task migrate: :environment do
    Hardware.find_each do |hardware|
      device = HardwareDevice.new(
        user_id: hardware.user_id,
        note: "condition - #{hardware.functional_condition}, state - #{hardware.status}",
        brand: hardware.manufacturer,
        model: hardware.model,
        serial_number: hardware.serial_number,
        device_type: hardware.type,

        used_since: Time.current,
        year_bought: Time.current,
        year_of_production: Time.current,
        category: 'other',
        state: 'good'
      )

      device.save!(validate: false)
    end
  end
end
