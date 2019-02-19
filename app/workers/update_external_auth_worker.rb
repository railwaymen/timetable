# frozen_string_literal: true

class UpdateExternalAuthWorker
  include Sidekiq::Worker
  sidekiq_options lock: :while_executing, on_conflict: :reject,
                  unique_args: :unique_args

  # :nocov:
  def self.unique_args(args)
    args.first(2)
  end
  # :nocov:

  def perform(project_id, work_time_task, work_time_id)
    UpdateExternalAuth.new(Project.find(project_id), work_time_task, WorkTime.find(work_time_id)).call
  end
end
