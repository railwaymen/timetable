# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UpdateExternalAuth do
  module ExternalAuthStrategy
    class Sample < Base
      def self.from_data(*args); end
    end
  end

  describe 'call' do
    it 'it calls external auth strategy with correct data' do
      auth = FactoryGirl.create(:external_auth, provider: 'Sample')
      strategy_double = double('strategy')
      task_id = 'TT-1'
      expect(ExternalAuthStrategy::Sample).to receive(:from_data).with(auth.data).and_return(strategy_double)
      tasks = Array.new(2).map { FactoryGirl.create(:work_time, project: auth.project, integration_payload: { 'Sample' => { 'task_id' => task_id } }) }
      FactoryGirl.create(:work_time, project: auth.project, integration_payload: { 'Sample' => { 'task_id' => 'TT-3' } })

      expect(strategy_double).to receive(:update).with('task_id' => task_id, 'time_spent' => tasks.map(&:duration).inject(:+))
      described_class.new(auth.project, task_id).call
    end
  end
end
