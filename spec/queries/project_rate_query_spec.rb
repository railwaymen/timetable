# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ProjectRateQuery do
  describe '#project_stats' do
    it 'returns valida data' do
      project1 = create(:project)
      project2 = create(:project)

      create(:work_time, project: project1, starts_at: Time.zone.now.beginning_of_day + 8.hours, ends_at: Time.zone.now.beginning_of_day + 10.hours)
      create(:work_time, project: project2, starts_at: Time.zone.now.beginning_of_day + 8.hours, ends_at: Time.zone.now.beginning_of_day + 9.hours)

      results = described_class.new(active: true, starts_at: 30.days.ago, ends_at: Time.zone.now).results
      expect(results.first.project_id).to eql(project1.id)
      expect(results.first.total).to eql(7200)
      expect(results.second.project_id).to eql(project2.id)
      expect(results.second.total).to eql(3600)
    end
  end
end
