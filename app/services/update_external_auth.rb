# frozen_string_literal: true

class UpdateExternalAuth
  attr_reader :project, :work_time_task

  def initialize(project, work_time_task)
    @project = project
    @work_time_task = work_time_task
  end

  def call
    ExternalAuthStrategy.const_get(project.external_auth.provider.camelize).from_data(project.external_auth.data).update(
      'task_id' => work_time_task,
      'time_spent' => calculate_sum
    )
  end

  private

  def calculate_sum
    WorkTime.where(project_id: project.id, active: true)
            .where("integration_payload->:provider->>'task_id' = :task_id", provider: project.external_auth.provider, task_id: work_time_task)
            .sum('EXTRACT(EPOCH FROM ends_at - starts_at)::int')
  end
end
