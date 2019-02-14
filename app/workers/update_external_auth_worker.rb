# frozen_string_literal: true

class UpdateExternalAuthWorker
  include Sidekiq::Worker

  def perform(project_id, work_time_task)
    UpdateExternalAuth.new(Project.find(project_id), work_time_task).call
  end
end
