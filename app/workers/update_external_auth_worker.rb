# frozen_string_literal: true

class UpdateExternalAuthWorker
  include Sidekiq::Worker
  sidekiq_options lock: :while_executing, on_conflict: :reject

  def perform(project_id, work_time_task)
    UpdateExternalAuth.new(Project.find(project_id), work_time_task).call
  end
end
