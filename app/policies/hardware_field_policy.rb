# frozen_string_literal: true

class HardwareFieldPolicy < ApplicationPolicy
  def update?
    if user.admin || user.hardware_manager?
      true
    else
      !record.hardware.locked?
    end
  end

  alias create? update?
  alias destroy? update?
end
