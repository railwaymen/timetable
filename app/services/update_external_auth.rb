# frozen_string_literal: true

class UpdateExternalAuth
  attr_reader :project, :work_time_task, :user_id

  def initialize(project, work_time_task, user_id)
    @project = project
    @work_time_task = work_time_task
    @user_id = user_id
  end

  def call
    ExternalAuthStrategy.init_from_data(project.external_auth.provider.camelize, project.external_auth.data).update(
      'task_id' => work_time_task,
      'time_spent' => calculate_sum,
      'user_id' => user_id
    )
  end

  private

  def calculate_sum
    WorkTime.where(project_id: project.id, active: true)
            .where("integration_payload->:provider->>'task_id' = :task_id", provider: project.external_auth.provider, task_id: work_time_task)
            .sum('EXTRACT(EPOCH FROM ends_at - starts_at)::int')
  end
end
