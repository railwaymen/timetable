# frozen_string_literal: true

require 'logger'

class UpdateExternalAuth
  attr_reader :project, :work_time_task, :work_time

  def initialize(project, work_time_task, work_time)
    @project = project
    @work_time_task = work_time_task
    @name = project.external_auth.provider.camelize
    @logger = Logger.new("#{Rails.root}/log/#{@name}_auth.log")
    @work_time = work_time
  end

  def call
    res = ExternalAuthStrategy.const_get(name).from_data(project.external_auth.data).update(
      'task_id' => work_time_task,
      'time_spent' => calculate_sum
    )
    logger.info("Updating work_time_id: #{work_time.id} (task: #{work_time.external_task_id}, user_id: #{work_time.user_id}) in project_id: #{project.id} returned #{res}")
    res
  rescue StandardError => e
    logger.error("Updating work_time_id: #{work_time.id} (task: #{work_time.external_task_id}, user_id: #{work_time.user_id}) in project_id: #{project.id} raised #{e}")
    raise e
  end

  private

  attr_reader :logger, :name

  def calculate_sum
    WorkTime.where(project_id: project.id, active: true)
            .where("integration_payload->:provider->>'task_id' = :task_id", provider: project.external_auth.provider, task_id: work_time_task)
            .sum('EXTRACT(EPOCH FROM ends_at - starts_at)::int')
  end
end
