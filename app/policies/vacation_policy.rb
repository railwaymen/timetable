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
end
