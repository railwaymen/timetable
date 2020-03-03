# frozen_string_literal: true

namespace :eslint do
  desc 'Run eslint'
  task run: :environment do
    sh 'yarn lint'
  end
end
