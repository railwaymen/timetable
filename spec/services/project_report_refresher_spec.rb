# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ProjectReportRefresher do
  module ExternalAuthStrategy
    class Sample < Base; def self.from_data(*args); end; end
  end

  describe 'refreshes integration_payload' do
    let(:admin) { create(:user, :admin) }

    it 'updates integration_payload' do
      last_body = { development: [task: 'task-url', integration_payload: { Sample: { type: 'Feature' } }] }
      project_report = create(:project_report, last_body: last_body)
      auth = FactoryBot.create(:external_auth, provider: 'Sample', user: admin)

      strategy_double = double('strategy')
      allow(ExternalAuthStrategy::Sample).to receive(:from_data).with(auth.data).and_return(strategy_double)
      allow(strategy_double).to receive(:integration_payload).with('task-url').and_return({ type: 'Bug' })

      ProjectReportRefresher.new(project_report_id: project_report.id, user_id: admin.id).call

      expected_payload = { 'Sample' => { 'type' => 'Bug' } }
      expect(project_report.reload.last_body['development'][0]['integration_payload']).to eql(expected_payload)
      expect(project_report.refreshed_at).to be_within(1.second).of Time.current
    end

    it 'caches response' do
      last_body = {
        development: [task: 'task-url', integration_payload: { Sample: { type: 'Feature' } }],
        qa: [task: 'task-url', integration_payload: { Sample: { type: 'Feature' } }]
      }
      project_report = create(:project_report, last_body: last_body)
      auth = FactoryBot.create(:external_auth, provider: 'Sample', user: admin)

      strategy_double = double('strategy')
      allow(ExternalAuthStrategy::Sample).to receive(:from_data).with(auth.data).and_return(strategy_double)
      allow(strategy_double).to receive(:integration_payload).with('task-url').and_return({ type: 'Bug' })

      ProjectReportRefresher.new(project_report_id: project_report.id, user_id: admin.id).call

      expect(strategy_double).to have_received(:integration_payload).with('task-url').once
    end

    it 'raises error if response is incorrect' do
      last_body = { development: [task: 'task-url', integration_payload: { Sample: { type: 'Feature' } }] }
      project_report = create(:project_report, last_body: last_body)
      auth = FactoryBot.create(:external_auth, provider: 'Sample', user: admin)

      strategy_double = double('strategy')
      allow(ExternalAuthStrategy::Sample).to receive(:from_data).with(auth.data).and_return(strategy_double)
      allow(strategy_double).to receive(:integration_payload).with('task-url').and_return(nil)

      expect do
        ProjectReportRefresher.new(project_report_id: project_report.id, user_id: admin.id).call
      end.to raise_error('Refresh from provider Sample failed, task: task-url')

      expect(project_report.reload.refresh_status).to eql('error')
    end
  end
end
