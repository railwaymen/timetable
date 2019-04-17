# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ProjectReport, type: :model do
  describe '#body_did_not_lose_duration' do
    let(:project) { create(:project) }
    it 'does not allow to duration change' do
      body = { development: [task: 'task', owner: 'Owner', duration: 300] }
      project_report = create(:project_report, initial_body: body, last_body: body, duration_sum: 300)
      project_report.last_body = { development: [task: 'task1', owner: 'Owner', duration: 200] }
      expect(project_report).not_to be_valid
    end

    it 'does allow change when duration sum does not change' do
      body = { development: [task: 'task', owner: 'Owner', duration: 300] }
      project_report = create(:project_report, initial_body: body, last_body: body, duration_sum: 300)
      project_report.last_body = { development: [task: 'task1', owner: 'Owner', duration: 300] }
      expect(project_report).to be_valid
    end
  end
end
