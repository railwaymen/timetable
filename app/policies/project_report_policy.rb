# frozen_string_literal: true

class ProjectReportPolicy < ApplicationPolicy
  def create?
    user.admin? || user.manager?
  end

  def update?
    create?
  end

  def synchronize?
    create?
  end

  def show?
    create?
  end

  def edit?
    create?
  end

  def destroy?
    create?
  end

  def roles?
    create?
  end

  def generate?
    create?
  end

  def index?
    create?
  end

  def file?
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
