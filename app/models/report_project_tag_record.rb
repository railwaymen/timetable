# frozen_string_literal: true

class ReportProjectTagRecord
  attr_reader :project_id, :project_name, :tag, :tag_id, :project_duration, :duration

  include ActiveModel::Validations
  validates :project_id,
            :project_name,
            :project_duration,
            :duration,
            :tag, :tag_id,
            presence: true

  def initialize(project_id:, project_name:, tag:, tag_id:, project_duration:, duration:) # rubocop:disable Metrics/ParameterLists
    @project_id       = project_id
    @project_name     = project_name
    @project_duration = project_duration
    @tag              = tag
    @tag_id           = tag_id
    @duration         = duration
    raise(RecordError, errors) unless valid?
  end
end
