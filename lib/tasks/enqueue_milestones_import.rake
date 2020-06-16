# frozen_string_literal: true

namespace :tasks do
  desc 'Enqueues milestone import for matching projects'
  task enqueue_milestones_import: :environment do
    Project.where(milestones_import_enabled: true, external_integration_enabled: true).find_each do |project|
      ImportJiraMilestonesWorker.perform_async(project.id, project.milestones_import_user_id)
    end
  end
end
