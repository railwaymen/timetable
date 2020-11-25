# frozen_string_literal: true

class HardwareAccessoryPolicy < ApplicationPolicy
  def update?
    Rails.logger.info 'HMMMM'
    if user.admin? || user.hardware_manager?
      true
    else
      !record.hardware.locked? && record.hardware.in_office?
    end
  end

  alias create? update?
  alias destroy? update?
end
