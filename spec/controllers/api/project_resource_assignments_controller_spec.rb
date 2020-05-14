# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::ProjectResourceAssignmentsController do
  let(:user) { create(:user) }
  let(:admin) { create(:user, :admin) }

  describe '#index' do
    it 'authenticates user' do
      get :index, format: :json
      expect(response.code).to eql('401')
    end

    it 'returns assignments' do
      sign_in(admin)
      assignment = create(:project_resource_assignment)
      assignment_response = [{
        id: assignment.id,
        start: assignment.starts_at,
        end: assignment.ends_at,
        resourceId: assignment.resource_rid,
        title: assignment.title,
        note: assignment.note,
        bgColor: assignment.color,
        projectId: assignment.project_id,
        resourceRealId: assignment.project_resource_id,
        type: assignment.type,
        resizable: assignment.resizable,
        movable: assignment.movable
      }].to_json
      get :index, format: :json
      expect(response.body).to be_json_eql(assignment_response)
    end

    it 'filters assignments by user' do
      sign_in(admin)
      assignment = create(:project_resource_assignment)
      assignment_response = [{
        id: assignment.id,
        start: assignment.starts_at,
        end: assignment.ends_at,
        resourceId: assignment.resource_rid,
        title: assignment.title,
        note: assignment.note,
        bgColor: assignment.color,
        projectId: assignment.project_id,
        resourceRealId: assignment.project_resource_id,
        type: assignment.type,
        resizable: assignment.resizable,
        movable: assignment.movable
      }].to_json
      get :index, params: { selected_users: assignment.project_resource.user_id }, format: :json
      expect(response.body).to be_json_eql(assignment_response)
    end

    it 'filters assignments by project' do
      sign_in(admin)
      assignment = create(:project_resource_assignment)
      assignment_response = [{
        id: assignment.id,
        start: assignment.starts_at,
        end: assignment.ends_at,
        resourceId: assignment.resource_rid,
        title: assignment.title,
        note: assignment.note,
        bgColor: assignment.color,
        projectId: assignment.project_id,
        resourceRealId: assignment.project_resource_id,
        type: assignment.type,
        resizable: assignment.resizable,
        movable: assignment.movable
      }].to_json
      get :index, params: { selected_projects: assignment.project_id }, format: :json
      expect(response.body).to be_json_eql(assignment_response)
    end
  end

  describe '#create' do
    it 'authenticates user' do
      post :create, format: :json
      expect(response.code).to eql('401')
    end

    it 'creates assignment' do
      sign_in(admin)
      resource = create(:project_resource)
      project = create(:project)
      params = {
        project_id: project.id,
        resource_rid: resource.rid,
        starts_at: Time.current.beginning_of_day,
        ends_at: Time.current.end_of_day + 3.days,
        title: project.name,
        color: project.color
      }
      post :create, params: params, as: :json
      new_assignment = ProjectResourceAssignment.last
      expect(new_assignment.user_id).to eql(resource.user_id)
      expect(new_assignment.project_resource_id).to eql(resource.id)
      expect(new_assignment.project_id).to eql(project.id)
      expect(new_assignment.title).to eql(project.name)
      expect(new_assignment.color).to eql(project.color)
      expect(new_assignment.resource_rid).to eql(resource.rid)
      expect(new_assignment.type).to eql(1)
    end
  end

  describe '#update' do
    it 'authenticates user' do
      put :update, params: { id: 1 }, format: :json
      expect(response.code).to eql('401')
    end

    it 'updates assignment' do
      sign_in(admin)
      project = create(:project)
      resource1 = create(:project_resource)
      resource2 = create(:project_resource)
      assignment = create(:project_resource_assignment, project_resource: resource1, user: resource1.user, resource_rid: resource1.rid)
      params = {
        id: assignment.id,
        starts_at: Time.current.beginning_of_day + 4.days,
        ends_at: Time.current.end_of_day + 7.days,
        resource_rid: resource2.rid,
        project_id: project.id
      }
      patch :update, params: params, as: :json
      expect(assignment.reload.user_id).to eql(resource2.user.id)
      expect(assignment.project_resource_id).to eql(resource2.id)
      expect(assignment.starts_at.to_date).to eql(params[:starts_at].to_date)
      expect(assignment.ends_at.to_date).to eql(params[:ends_at].to_date)
      expect(assignment.resource_rid).to eql(resource2.rid)
      expect(assignment.project_id).to eql(project.id)
    end
  end

  describe '#delete' do
    it 'authenticates user' do
      delete :destroy, params: { id: 1 }, format: :json
      expect(response.code).to eql('401')
    end

    it 'destroys assignment' do
      sign_in(admin)
      assignment = create(:project_resource_assignment)
      delete :destroy, params: { id: assignment.id }, as: :json
      expect(assignment.reload.discarded?).to be(true)
    end
  end
end
