# frozen_string_literal: true

class ReportProjectTagRecord
  attr_reader :project_id, :project_name, :tag, :project_duration, :duration

  include ActiveModel::Validations
  validates :project_id,
            :project_name,
            :project_duration,
            :duration,
            :tag,
            presence: true

  def initialize(
    project_id:,
    project_name:,
    tag:,
    project_duration:,
    duration:
  )
    @project_id       = project_id
    @project_name     = project_name
    @project_duration = project_duration
    @tag              = tag
    @tag_label        = I18n.t("apps.tag.#{tag}")
    @duration         = duration
    raise(RecordError, errors) unless valid?
  end
end
