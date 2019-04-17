# frozen_string_literal: true

class ProjectReportPolicy < ApplicationPolicy
  def create?
    user.admin? || user.manager?
  end

  def update?
    create?
  end

  def show?
    create?
  end

  def edit?
    create?
  end

  def roles?
    create?
  end

  class Scope < Scope
    # :nocov:
    def resolve
      if user.admin? || user.manager?
        scope.all
      else
        scope.none
      end
    end
    # :nocov:
  end
end
