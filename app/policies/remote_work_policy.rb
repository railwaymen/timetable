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

  class Scope < Scope
    def resolve
      if user.admin?
        scope.all
      else
        scope.where(user_id: user.id)
      end
    end
  end
end
