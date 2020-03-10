# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::EventsController do
  render_views

  let(:user) { create(:user) }
  let(:admin) { create(:admin) }

  describe '#index' do
    it 'authenticates user' do
      get :index, format: :json
      expect(response.code).to eql('401')
    end

    it 'forbids regular user' do
      sign_in(user)
      get :index, format: :json
      expect(response.code).to eql('403')
    end

    it 'returns events' do
      sign_in(admin)
      event = create(:event)
      event_response = [{
        id: event.id,
        start: event.starts_at,
        end: event.ends_at,
        resourceId: event.resource_rid,
        title: event.title,
        bgColor: event.color,
        projectId: event.project_id,
        resourceRealId: event.resource_id,
        type: event.type,
        resizable: event.resizable,
        movable: event.movable
      }].to_json
      get :index, format: :json
      expect(response.body).to be_json_eql(event_response)
    end
  end

  describe '#create' do
    it 'authenticates user' do
      post :create, format: :json
      expect(response.code).to eql('401')
    end

    it 'forbids regular user' do
      sign_in(user)
      post :create, format: :json
      expect(response.code).to eql('403')
    end

    it 'creates event' do
      sign_in(admin)
      resource = create(:resource)
      project = create(:project)
      params = {
        project_id: project.id,
        resource_rid: resource.rid,
        starts_at: Time.current.beginning_of_day,
        ends_at: Time.current.end_of_day + 3.days,
        title: project.name,
        color: project.color
      }
      post :create, params: { event: params }, as: :json
      new_event = Event.last
      expect(new_event.user_id).to eql(resource.user_id)
      expect(new_event.resource_id).to eql(resource.id)
      expect(new_event.project_id).to eql(project.id)
      expect(new_event.title).to eql(project.name)
      expect(new_event.color).to eql(project.color)
      expect(new_event.resource_rid).to eql(resource.rid)
      expect(new_event.type).to eql(1)
    end
  end

  describe '#update' do
    it 'authenticates user' do
      put :update, params: { id: 1 }, format: :json
      expect(response.code).to eql('401')
    end

    it 'forbids regular user' do
      sign_in(user)
      put :update, params: { id: 1 }, format: :json
      expect(response.code).to eql('403')
    end

    it 'updates event' do
      sign_in(admin)
      project = create(:project)
      resource1 = create(:resource)
      resource2 = create(:resource)
      event = create(:event, resource: resource1, user: resource1.user, resource_rid: resource1.rid)
      params = {
        starts_at: Time.current.beginning_of_day + 4.days,
        ends_at: Time.current.end_of_day + 7.days,
        resource_rid: resource2.rid,
        project_id: project.id
      }
      patch :update, params: { id: event.id, event: params }, as: :json
      expect(event.reload.user_id).to eql(resource2.user.id)
      expect(event.resource_id).to eql(resource2.id)
      expect(event.starts_at.to_date).to eql(params[:starts_at].to_date)
      expect(event.ends_at.to_date).to eql(params[:ends_at].to_date)
      expect(event.resource_rid).to eql(resource2.rid)
      expect(event.project_id).to eql(project.id)
    end
  end

  describe '#delete' do
    it 'authenticates user' do
      delete :destroy, params: { id: 1 }, format: :json
      expect(response.code).to eql('401')
    end

    it 'forbids regular user' do
      sign_in(user)
      delete :destroy, params: { id: 1 }, format: :json
      expect(response.code).to eql('403')
    end

    it 'destroys event' do
      sign_in(admin)
      event = create(:event)
      delete :destroy, params: { id: event.id }, as: :json
      expect { event.reload }.to raise_exception(ActiveRecord::RecordNotFound)
    end
  end
end
