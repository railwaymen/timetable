# frozen_string_literal: true

class UpdateProjectForm
  include ActiveModel::Model

  attr_accessor :project, :active, :name, :color, :leader_id, :work_times_allows_task, :milestones_import_enabled,
                :external_integration_enabled, :external_id, :current_user

  def initialize(attributes = {})
    super
    @attributes = attributes
  end

  def save
    project.milestones_import_user = milestones_import_enabled ? current_user : nil
    project.update(@attributes.slice(:name, :color, :leader_id, :work_times_allows_task, :milestones_import_enabled,
                                     :external_integration_enabled, :external_id))
    active.is_a?(FalseClass) ? project.discard : project.undiscard
  end
end
