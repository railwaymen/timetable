# frozen_string_literal: true

class ImportJiraMilestonesWorker
  include Sidekiq::Worker
  include Sidekiq::Status::Worker

  def perform(project_id, user_id)
    project = Project.find(project_id)
    user = User.find(user_id)

    ImportMilestones.new(project, user).call
  end
end
