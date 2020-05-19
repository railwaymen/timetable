# frozen_string_literal: true

class VacationPolicy < ApplicationPolicy
  def permitted_attributes
    user.admin? || user.staff_manager? ? staff_manager_params : user_params
  end

  private

  def user_params
    %i[start_date end_date vacation_type description]
  end

  def staff_manager_params
    user_params.concat(%i[user_id])
  end

  class Scope < Scope
    def resolve
      if user.admin? || user.staff_manager? || user.leader? || user.manager?
        scope.all
      else
        scope.where(user_id: user.id)
      end
    end
  end
end
