# frozen_string_literal: true

class TagPolicy < ApplicationPolicy
  def index?
    user.admin? || user.manager?
  end

  def update?
    user.admin? || user.manager?
  end

  alias show? index?
  alias create? index?
end
