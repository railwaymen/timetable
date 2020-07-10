# frozen_string_literal: true

class WorkTimePolicy < ApplicationPolicy
  def update?
    return true if record.project.nil?

    !record.project.vacation?
  end

  alias destroy? update?
  alias create? update?
  alias create_filling_gaps? update?

  class Scope < Scope
    def resolve
      if user.admin? || user.manager?
        scope.all
      else
        scope.joins(:project).where('work_times.user_id=:user_id OR projects.leader_id=:user_id', user_id: user.id)
      end
    end
  end
end
