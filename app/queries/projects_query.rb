# frozen_string_literal: true

class ProjectsQuery
  def initialize(visibility: 'all', type: 'all')
    @type = type
    @visibility = visibility
  end

  def results
    projects = Project.includes(:leader).order(name: :asc)
    projects = filter_by_visibility(projects)
    filter_by_type(projects)
  end

  private

  def filter_by_type(projects)
    return projects.where(internal: false) if @type == 'commercial'
    return projects.where(internal: true) if @type == 'internal'

    projects
  end

  def filter_by_visibility(projects)
    return projects.kept if @visibility == 'active'
    return projects.discarded if @visibility == 'inactive'

    projects
  end
end
