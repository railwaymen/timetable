# frozen_string_literal: true

class ResourcesService
  def call(params)
    if params[:group_only]
      create_resource_group(params)
    else
      create_resource(params)
    end
  end

  private

  def create_resource_group(params)
    parent_id = params[:parent_rid]
    rid, parent_rid = generate_rid_and_parent_id(params[:name].downcase.tr(' ', '-'), parent_id)
    ProjectResource.create(params.merge(rid: rid, parent_rid: parent_rid, project_resource_id: parent_id))
  end

  def create_resource(params)
    parent_id = params[:parent_rid]
    user = User.find(params[:user_id])
    rid, parent_rid = generate_rid_and_parent_id(user.id.to_s, parent_id)
    resource = ProjectResource.create(params.merge(name: user.name, rid: rid, parent_rid: parent_rid, project_resource_id: parent_id))
    create_vacation_events(resource, user) if user.vacations.any?
    resource
  end

  def create_vacation_events(resource, user)
    vacation_project = Project.vacation.first!
    user.vacations.each do |vacation|
      starts_at = vacation.start_date.beginning_of_day
      ends_at = vacation.end_date.end_of_day
      ProjectResourceAssignment.create(user_id: user.id, project_id: vacation_project.id, project_resource_id: resource.id, resource_rid: resource.rid, vacation_id: vacation.id,
                                       starts_at: starts_at, ends_at: ends_at, title: vacation_project.name, color: "##{vacation_project.color}", type: 2,
                                       resizable: false, movable: false)
    end
  end

  def generate_rid_and_parent_id(name, parent_id)
    if parent_id.present?
      parent_resource = ProjectResource.find(parent_id)
      rid = "#{parent_resource.rid}-#{name}"
      parent_rid = parent_resource.rid
    else
      rid = name
      parent_rid = nil
    end
    [rid, parent_rid]
  end
end
