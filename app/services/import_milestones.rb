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
      milestone.position ||= (@project.milestones.maximum(:position) || 0) + 1
      milestone.external_estimate = fetch_milestone_estimate(version.id)
      milestone.update!(values)
    end
  end

  def fetch_milestone_estimate(version_id)
    client.version_issues(@project.external_id, version_id).map(&:timeoriginalestimate).sum
  end

  def client
    @client ||= ExternalAuthStrategy::Jira.from_data(@user.external_auth.data)
  end
end