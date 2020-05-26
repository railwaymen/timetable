# frozen_string_literal: true

class MilestonePolicy < ApplicationPolicy
  def create?
    user.admin? || user.manager?
  end

  alias index? create?
  alias show? create?
  alias update? create?
end
