# frozen_string_literal: true

class UpdateExternalAuthWorker
  include Sidekiq::Worker

  def perform(project_id, work_time_task, work_time_id)
    UpdateExternalAuth.new(Project.find(project_id), work_time_task, WorkTime.find(work_time_id)).call
  end
end
