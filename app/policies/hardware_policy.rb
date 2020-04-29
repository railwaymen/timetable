# frozen_string_literal: true

class HardwarePolicy < ApplicationPolicy
  def update?
    if user.hardware_manager?
      true
    elsif record.locked?
      false
    else
      true
    end
  end

  def permitted_attributes
    user.hardware_manager? ? hardware_manager_params : user_params
  end

  private

  def user_params
    %i[type
       manufacturer
       serial_number
       model
       user_id]
  end

  def hardware_manager_params
    %i[type
       manufacturer
       serial_number
       model
       user_id
       locked]
  end

  class Scope < Scope
    def resolve
      if user.hardware_manager?
        scope.all
      else
        scope.where(user_id: user.id)
      end
    end
  end
end
