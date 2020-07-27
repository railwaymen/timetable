# frozen_string_literal: true

class VacationPeriodPolicy < ApplicationPolicy
  def update?
    user.admin? || user.staff_manager?
  end

  def generate?
    user.admin? || user.staff_manager?
  end

  class Scope < Scope
    def resolve
      if user.admin? || user.staff_manager?
        scope.all
      else
        scope.rewhere(user_id: user.id)
      end
    end
  end
end
