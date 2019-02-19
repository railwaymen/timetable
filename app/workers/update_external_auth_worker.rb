# frozen_string_literal: true

class UpdateExternalAuthWorker
  include Sidekiq::Worker
  sidekiq_options lock: :while_executing, on_conflict: :reject,
                  unique_args: :unique_args

  def self.unique_args(args)
    args.first(2)
  end

  def perform(project_id, work_time_task, user_id)
    UpdateExternalAuth.new(Project.find(project_id), work_time_task, user_id).call
  end
end
