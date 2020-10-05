# frozen_string_literal: true

class ProjectPolicy < ApplicationPolicy
  def permitted_attributes
    user.admin? || user.manager? ? admin_params : leader_params
  end

  private

  def leader_params
    %i[color work_times_allows_task external_integration_enabled]
  end

  def admin_params
    %i[name color leader_id active work_times_allows_task tags_enabled milestones_import_enabled external_integration_enabled external_id]
  end
end
