# frozen_string_literal: true

class ProjectResourcePolicy < ApplicationPolicy
  def index?
    user.admin? || user.manager?
  end

  alias activity? index?
  alias create? index?
  alias destroy? index?
end
