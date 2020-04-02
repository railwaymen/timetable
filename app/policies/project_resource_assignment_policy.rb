# frozen_string_literal: true

class ProjectResourceAssignmentPolicy < ApplicationPolicy
  def index?
    user.admin? || user.manager?
  end

  alias find_by_slot? index?
  alias create? index?
  alias update? index?
  alias destroy? index?
end
