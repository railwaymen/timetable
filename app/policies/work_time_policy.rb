# frozen_string_literal: true

class WorkTimePolicy < ApplicationPolicy
  def update?
    return true if record.project.nil?

    user.admin? || !record.project.accounting?
  end

  def permitted_attributes
    record.persisted? ? permitted_update_attributes : permitted_create_attributes
  end

  private

  def permitted_create_attributes
    params = %i[
      project_id
      body
      task
      tag
      starts_at
      ends_at
    ]
    params = params.concat(%i[user_id]) if user.admin?
    params
  end

  def permitted_update_attributes
    %i[
      body
      task
      tag
      starts_at
      ends_at
    ]
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
