# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UpdateExternalAuth do
  module ExternalAuthStrategy
    class Sample < Base
      def self.from_data(*args); end
    end
  end

  describe '#call' do
    it 'it calls external auth strategy with correct data' do
      logger_double = double('logger')
      allow(Logger).to receive(:new) { logger_double }
      auth = FactoryBot.create(:external_auth, provider: 'Sample')
      project = FactoryBot.create(:project)
      strategy_double = double('strategy')
      task_id = 'TT-1'
      expect(ExternalAuthStrategy::Sample).to receive(:from_data).with(auth.data).and_return(strategy_double)
      tasks = Array.new(2).map { FactoryBot.create(:work_time, project: project, user: auth.user, integration_payload: { 'Sample' => { 'task_id' => task_id } }) }
      FactoryBot.create(:work_time, project: project, user: auth.user, integration_payload: { 'Sample' => { 'task_id' => 'TT-3' } })

      expect(strategy_double).to receive(:update).with('task_id' => task_id, 'time_spent' => tasks.map(&:duration).inject(:+))
      expect(logger_double).to receive(:info)
      described_class.new(project, task_id, tasks.first).call
    end

    it 'handles error' do
      logger_double = double('logger')
      allow(Logger).to receive(:new) { logger_double }
      auth = FactoryBot.create(:external_auth, provider: 'Sample')
      project = FactoryBot.create(:project)
      strategy_double = double('strategy')
      task_id = 'TT-1'
      expect(ExternalAuthStrategy::Sample).to receive(:from_data).with(auth.data).and_return(strategy_double)
      tasks = Array.new(2).map { FactoryBot.create(:work_time, project: project, user: auth.user, integration_payload: { 'Sample' => { 'task_id' => task_id } }) }
      FactoryBot.create(:work_time, project: project, user: auth.user, integration_payload: { 'Sample' => { 'task_id' => 'TT-3' } })

      error = StandardError.new('Error')
      expect(strategy_double).to receive(:update).with('task_id' => task_id, 'time_spent' => tasks.map(&:duration).inject(:+)).and_raise(error)
      expect(logger_double).to receive(:error)
      expect { described_class.new(project, task_id, tasks.first).call }.to raise_error(error)
    end
  end
end
