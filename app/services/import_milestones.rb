# frozen_string_literal: true

class ImportMilestones
  def initialize(project, user)
    @project = project
    @user = user
  end

  def call
    Milestone.transaction do
      fetch_milestones
    end
  end

  private

  def fetch_milestones
    client.versions(@project.external_id).each do |version|
      values = { external_id: version.id, name: version.attrs['name'], starts_on: version.attrs['startDate'], ends_on: version.attrs['releaseDate'] }
      milestone = @project.milestones.where("external_payload->>'id' = ?", version.id).first_or_initialize
      update_milestone(milestone, version.id)
      create_estimate(milestone) if milestone.persisted? && milestone.external_estimate_changed?
      milestone.update!(values)
    end
  end

  def update_milestone(milestone, version_id)
    version_issues = client.version_issues(@project.external_id, version_id)
    milestone.external_estimate = version_issues.map(&:timeoriginalestimate).compact.sum
    milestone.jira_issues = version_issues.map(&:key)
  end

  def create_estimate(milestone)
    estimate_values = milestone.slice('dev_estimate', 'qa_estimate', 'ux_estimate', 'pm_estimate', 'other_estimate', 'total_estimate')
    diff = milestone.external_estimate - milestone.external_estimate_was
    milestone.estimates.create! estimate_values.merge(external_estimate: milestone.external_estimate, external_estimate_diff: diff, total_estimate_diff: diff)
  end

  def client
    @client ||= ExternalAuthStrategy::Jira.from_data(@user.external_auth.data)
  end
end
