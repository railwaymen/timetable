# frozen_string_literal: true

if %w[development test].include? Rails.env
  require 'rubocop/rake_task'
  RuboCop::RakeTask.new

  task(:default).clear.enhance(['db:environment:set', 'db:test:prepare', 'rubocop', 'spec'])
end
