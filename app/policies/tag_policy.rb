# frozen_string_literal: true

class TagPolicy < ApplicationPolicy
  def update?
    !record.work_times.kept.exists?
  end
end
