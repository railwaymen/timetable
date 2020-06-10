# frozen_string_literal: true

class UpdateProjectForm
  include ActiveModel::Model

  attr_accessor :project, :active, :name, :color, :leader_id, :work_times_allows_task, :external_integration_enabled, :external_id

  def initialize(attributes = {})
    super
    @attributes = attributes
  end

  def save
    project.update(@attributes.slice(:name, :color, :leader_id, :work_times_allows_task, :external_integration_enabled, :external_id))
    active ? project.undiscard : project.discard
  end
end
