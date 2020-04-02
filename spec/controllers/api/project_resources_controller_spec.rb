# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::ProjectResourcesController do
  render_views

  let(:user) { create(:user) }
  let(:admin) { create(:user, :admin) }

  describe '#index' do
    it 'authenticates user' do
      get :index, format: :json
      expect(response.code).to eql('401')
    end

    it 'returns resources' do
      sign_in(admin)
      resource = create(:project_resource)
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

    it 'filters by users' do
      sign_in(admin)
      resource = create(:project_resource)
      create(:project_resource)

      resource_response = [{
        id: resource.rid,
        name: resource.name,
        groupOnly: resource.group_only,
        parentId: resource.parent_rid,
        realId: resource.id
      }].to_json
      get :index, params: { selected_users: resource.user_id }, format: :json
      expect(response.body).to be_json_eql(resource_response)
    end
  end

  describe '#activity' do
    it 'authenticates user' do
      get :activity, format: :json
      expect(response.code).to eql('401')
    end

    it 'returns valid response' do
      sign_in(admin)
      PaperTrail.enabled = true
      PaperTrail.request(whodunnit: admin.id) do
        resource = create(:project_resource)
        get :activity, format: :json
        version_response = [{
          name: resource.name,
          event: :create,
          item_type: resource.class.to_s,
          creator_id: admin.id
        }]
        expect(response.body).to be_json_eql(version_response.to_json)
      end
      PaperTrail.enabled = false
    end
  end

  describe '#create' do
    it 'authenticates user' do
      post :create, format: :json
      expect(response.code).to eql('401')
    end

    context 'creates resource' do
      it 'as not group with parent' do
        sign_in(admin)
        resource = create(:project_resource, user: nil, group_only: true, name: 'Test group')
        params = {
          group_only: false,
          parent_rid: resource.id,
          user_id: user.id
        }
        post :create, params: params, as: :json
        new_resource = ProjectResource.last
        expect(new_resource.name).to eql(user.name)
        expect(new_resource.project_resource_id).to eql(resource.id)
        expect(new_resource.rid).to eql("#{resource.rid}-#{user.id}")
        expect(new_resource.parent_rid).to eql(resource.rid)
      end

      it 'as group without parent' do
        sign_in(admin)
        params = {
          name: 'Test group',
          group_only: true
        }
        post :create, params: params, as: :json
        new_resource = ProjectResource.last
        expect(new_resource.name).to eql('Test group')
        expect(new_resource.project_resource_id).to eql(nil)
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

    it 'destroys resource' do
      sign_in(admin)
      resource = create(:project_resource)
      delete :destroy, params: { id: resource.rid }, format: :json
      expect(resource.reload.discarded?).to be(true)
    end
  end
end
