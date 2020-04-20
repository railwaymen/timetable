# frozen_string_literal: true

class CombinedReportPolicy < ApplicationPolicy
  def create?
    user.admin? || user.manager?
  end

  def show?
    create?
  end

  def destroy?
    create?
  end

  def synchronize?
    create?
  end

  def file?
    create?
  end

  class Scope < Scope
    def resolve
      if user.admin? || user.manager?
        scope.all
      else
        scope.none
      end
    end
  end
end
