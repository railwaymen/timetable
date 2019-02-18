# frozen_string_literal: true

# frozen_literal_string: true

class ProjectRate
  attr_reader :id, :name, :total_for_user, :color, :total_for_project, :project_id, :user_first_name, :user_last_name,
              :leader_first_name, :leader_last_name

  class RecordError < StandardError; end
  include ActiveModel::Validations

  validates :id, :name, :total_for_user, :user_first_name, :user_last_name, :project_id, :total_for_project, presence: true

  # rubocop:disable Metrics/ParameterLists, Metrics/MethodLength
  def initialize(id:, name:, project_id:, color:, total_for_user:, total_for_project:,
                 user_first_name:, user_last_name:, leader_first_name:, leader_last_name:)
    @id                = id
    @project_id        = project_id
    @color             = color
    @name              = name
    @user_first_name   = user_first_name
    @user_last_name    = user_last_name
    @leader_first_name = leader_first_name
    @leader_last_name  = leader_last_name
    @total_for_user    = total_for_user
    @total_for_project = total_for_project
    raise(RecordError, errors) unless valid?
  end
  # rubocop:enable Metrics/ParameterLists, Metrics/MethodLength

  def self.stats(starts_at: 30.days)
    ProjectRateQuery.new(active: true, starts_at: Time.current - starts_at, ends_at: Time.current).results
  end
end
