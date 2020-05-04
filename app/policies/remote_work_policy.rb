# frozen_string_literal: true

class RemoteWorkPolicy < ApplicationPolicy
  def create?
    user.admin? || record.user_id == user.id
  end

  def update?
    create?
  end

  def destroy?
    create?
  end

  def permitted_attributes
    user.admin? ? admin_params : user_params
  end

  private

  def user_params
    %i[note starts_at ends_at]
  end

  def admin_params
    user_params.concat(%i[user_id])
  end

  class Scope < Scope
    def resolve
      if user.admin?
        scope.all
      else
        scope.rewhere(user_id: user.id)
      end
    end
  end
end
