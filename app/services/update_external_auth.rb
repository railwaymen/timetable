# frozen_string_literal: true

require 'logger'

class UpdateExternalAuth
  attr_reader :project, :work_time_task, :work_time

  def initialize(project, work_time_task, work_time)
    @project = project
    @work_time_task = work_time_task
    @external_auth = work_time.external_auth
    @name = @external_auth.provider
    @logger = Logger.new(Rails.root.join('log', "#{@name.downcase}_auth.log"))
    @work_time = work_time
  end

  def call
    res = ExternalAuthStrategy.const_get(name).from_data(@external_auth.data).update(
      'task_id' => work_time_task,
      'time_spent' => calculate_sum
    )
    logger.info("Updating work_time_id: #{work_time.id} (task: #{work_time_task}, user_id: #{work_time.user_id}) in project_id: #{project.id} returned #{res}")
    res
  rescue StandardError => e
    logger.error("Updating work_time_id: #{work_time.id} (task: #{work_time_task}, user_id: #{work_time.user_id}) in project_id: #{project.id} raised #{e}")
    raise e
  end

  private

  attr_reader :logger, :name

  def calculate_sum
    WorkTime.kept.where(project_id: project.id, user_id: work_time.user_id)
            .where("integration_payload->:provider->>'task_id' = :task_id", provider: name, task_id: work_time_task)
            .sum('EXTRACT(EPOCH FROM ends_at - starts_at)::int')
  end
end
