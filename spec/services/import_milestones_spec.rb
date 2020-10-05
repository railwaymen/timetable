# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ImportMilestones do
  describe 'call' do
    it 'fetch versions and assigned issues from jira & calculates estimates' do
      project = create(:project, :external_integration_enabled)
      user = create(:user, :with_external_auth)

      starts_on = Time.zone.today
      ends_on = 1.month.from_now.to_date

      version_id = '10'

      client = instance_double(ExternalAuthStrategy::Jira)
      versions = double(id: version_id, attrs: { 'name' => 'V1', 'startDate' => starts_on, 'releaseDate' => ends_on })
      issue = double(timeoriginalestimate: 3600, key: 'test')

      expect(ExternalAuthStrategy::Jira).to receive(:from_data).with(user.external_auth.data).and_return(client)
      expect(client).to receive(:versions).with(project.external_id).and_return([versions])
      expect(client).to receive(:version_issues).with(project.external_id, version_id).and_return([issue])

      ImportMilestones.new(project, user).call

      milestone = project.milestones.first
      expect(milestone.name).to eql('V1')
      expect(milestone.starts_on).to eql(starts_on)
      expect(milestone.ends_on).to eql(ends_on)
      expect(milestone.external_estimate).to eql(3600)
      expect(milestone.total_estimate).to eql(3600)
    end

    it 'updates exsting milestone & create estimate history record' do
      project = create(:project, :external_integration_enabled)
      user = create(:user, :with_external_auth)

      version_id = '10'
      milestone = create(:milestone, project: project, external_id: version_id, external_estimate: 10)

      client = instance_double(ExternalAuthStrategy::Jira)
      versions = double(id: version_id, attrs: { 'name' => 'V1' })
      issue = double(timeoriginalestimate: 15, key: 'test')

      expect(ExternalAuthStrategy::Jira).to receive(:from_data).with(user.external_auth.data).and_return(client)
      expect(client).to receive(:versions).with(project.external_id).and_return([versions])
      expect(client).to receive(:version_issues).with(project.external_id, version_id).and_return([issue])

      ImportMilestones.new(project, user).call

      expect(project.milestones.count).to eql(1)
      estimate = milestone.reload.estimates.first!
      expect(milestone.name).to eql('V1')
      expect(milestone.external_estimate).to eql(15)
      expect(milestone.total_estimate).to eql(15)
      expect(estimate.external_estimate).to eql(15)
      expect(estimate.external_estimate_diff).to eql(5)
    end
  end
end
