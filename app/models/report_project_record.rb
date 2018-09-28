# frozen_string_literal: true

class ReportProjectRecord
  attr_reader :project_id, :project_name, :user_id, :project_duration, :duration, :user_name

  include ActiveModel::Validations
  validates :project_id, :project_name, :project_duration, :duration, :user_name, presence: true

  # rubocop:disable Metrics/ParameterLists
  def initialize(project_id:, project_name:, user_id:, project_duration:, duration:, user_name:)
    @project_id       = project_id
    @project_name     = project_name
    @project_duration = project_duration
    @user_id          = user_id
    @duration         = duration
    @user_name        = user_name
    raise(RecordError, errors) unless valid?
  end
  # rubocop:enable Metrics/ParameterLists
end
