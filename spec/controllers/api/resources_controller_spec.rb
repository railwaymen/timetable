# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::ResourcesController do
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

    it 'returns resources' do
      sign_in(admin)
      resource = create(:resource)
      resource_response = [{
        id: resource.rid,
        name: resource.name,
        groupOnly: resource.group_only,
        parentId: resource.parent_rid,
        realId: resource.id
      }].to_json
      get :index, format: :json
      expect(response.body).to be_json_eql(resource_response)
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

    context 'creates resource' do
      it 'as not group with parent' do
        sign_in(admin)
        resource = create(:resource, user: nil, group_only: true, name: 'Test group')
        params = {
          group_only: false,
          parent_rid: resource.id,
          user_id: user.id
        }
        post :create, params: { resource: params }, as: :json
        new_resource = Resource.last
        expect(new_resource.name).to eql(user.to_s)
        expect(new_resource.resource_id).to eql(resource.id)
        expect(new_resource.rid).to eql("#{resource.rid}-#{user.id}")
        expect(new_resource.parent_rid).to eql(resource.rid)
      end

      it 'as group without parent' do
        sign_in(admin)
        params = {
          name: 'Test group',
          group_only: true
        }
        post :create, params: { resource: params }, as: :json
        new_resource = Resource.last
        expect(new_resource.name).to eql('Test group')
        expect(new_resource.resource_id).to eql(nil)
        expect(new_resource.rid).to eql('test-group')
        expect(new_resource.parent_rid).to eql(nil)
      end
    end
  end

  describe '#destroy' do
    it 'authenticates user' do
      delete :destroy, params: { id: 1 }, format: :json
      expect(response.code).to eql('401')
    end

    it 'forbids regular user' do
      sign_in(user)
      delete :destroy, params: { id: 1 }, format: :json
      expect(response.code).to eql('403')
    end

    it 'destroys resource, child resources and resource events' do
      sign_in(admin)
      parent_resource = create(:resource)
      child_resource = create(:resource, resource_id: parent_resource.id)
      event = create(:event, resource: parent_resource)
      delete :destroy, params: { id: parent_resource.rid }, format: :json
      expect { parent_resource.reload }.to raise_exception(ActiveRecord::RecordNotFound)
      expect { child_resource.reload }.to raise_exception(ActiveRecord::RecordNotFound)
      expect { event.reload }.to raise_exception(ActiveRecord::RecordNotFound)
    end
  end
end
