# frozen_string_literal: true

class MilestonePolicy < ApplicationPolicy
  def create?
    user.admin? || user.manager?
  end

  alias index? create?
  alias show? create?
  alias update? create?
  alias import? create?
  alias import_status? create?
  alias work_times? create?
end
