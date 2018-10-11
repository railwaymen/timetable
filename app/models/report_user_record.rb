# frozen_string_literal: true

class ReportUserRecord
  attr_reader :project_id, :project_name, :user_name, :user_id, :time_worked, :user_work_time, :internal

  include ActiveModel::Validations
  validates :user_name, :project_id, :user_id, :project_name, :time_worked, :user_work_time, presence: true

  # rubocop:disable Metrics/ParameterLists
  def initialize(user_name:, last_name:, project_id:, user_id:, project_name:, time_worked:, user_work_time:, internal:)
    @user_name      = user_name
    @project_id     = project_id
    @user_id        = user_id
    @project_name   = project_name
    @time_worked    = time_worked
    @user_work_time = user_work_time
    @internal       = internal
    @last_name      = last_name
    raise(RecordError, errors) unless valid?
  end
  # rubocop:enable Metrics/ParameterLists
end
