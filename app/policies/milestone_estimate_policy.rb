# frozen_string_literal: true

class MilestoneEstimatePolicy < ApplicationPolicy
  def index?
    user.admin? || user.manager?
  end
end
