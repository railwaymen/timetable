# frozen_string_literal: true

class CombinedReportPolicy < ApplicationPolicy
  def create?
    user.admin? || user.manager?
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
