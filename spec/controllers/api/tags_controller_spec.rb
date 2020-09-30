# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::TagsController do
  let(:user) { create(:user) }
  let(:admin) { create(:user, :admin) }
  let(:manager) { create(:user, :manager) }

  def tag_response(tag)
    tag.attributes.slice('id', 'name')
       .merge(active: tag.kept?,
              edit: tag.work_times.kept.exists?,
              project: {
                name: tag.project.name,
                id: tag.project.id
              })
  end

  describe '#index' do
    it 'authenticates user' do
      get :index, as: :json
      expect(response.code).to eql('401')
    end

    it 'returns tags with project' do
      manager = create(:user, :manager, contract_name: 'AX1')
      tag = create(:tag, :with_project)
      sign_in(manager)
      get :index, as: :json

      expect(response.code).to eql('200')
      expect(response.body).to be_json_eql([tag_response(tag)].to_json)
    end

    describe 'filters' do
      context 'all' do
        it 'return all possible records' do
          sign_in admin
          tag1 = create(:tag, :with_project, :discarded)
          tag2 = create(:tag, :with_project)

          expected_json = [tag1, tag2].map do |tag|
            tag_response(tag)
          end

          get :index, params: { filter: 'all' }, as: :json

          expect(response.body).to be_json_eql(expected_json.to_json)
        end
      end

      context 'active' do
        it 'return all active records' do
          sign_in admin
          create(:tag, :with_project, :discarded)
          tag = create(:tag, :with_project)

          get :index, params: { filter: 'active' }, as: :json

          expect(response.body).to be_json_eql([tag_response(tag)].to_json)
        end
      end

      context 'inactive' do
        it 'return all possible records' do
          sign_in admin
          tag = create(:tag, :with_project, :discarded)
          create(:tag)

          get :index, params: { filter: 'inactive' }, as: :json

          expect(response.body).to be_json_eql([tag_response(tag)].to_json)
        end
      end
    end
  end

  describe '#show' do
    it 'authenticates user' do
      get :show, params: { id: 1 }, as: :json
      expect(response.code).to eql('401')
    end

    it 'returns tag' do
      sign_in(manager)
      tag = create(:tag, :with_project)
      tag_response = tag.slice(:id, :name).merge(active: tag.kept?, project_name: tag.project.name)

      get :show, params: { id: tag.id }, as: :json

      expect(response.code).to eql('200')
      expect(response.body).to be_json_eql(tag_response.to_json)
    end
  end

  describe '#create' do
    it 'authenticates user' do
      post :create, as: :json
      expect(response.code).to eql('401')
    end

    it 'authorizes admin' do
      sign_in(user)
      post :create, as: :json
      expect(response.code).to eql('403')
    end

    it 'creates tag as manager' do
      sign_in(manager)
      name = 'test'
      project = create(:project)
      tag_params = { name: name, project_name: project.name }

      post :create, params: { tag: tag_params }, as: :json

      expect(response.code).to eql('201')
      tag = Tag.find_by name: name
      expect(tag.project).to eq(project)
    end
  end

  describe '#update' do
    it 'authenticates user' do
      put :update, params: { id: 1 }, as: :json
      expect(response.code).to eql('401')
    end

    it 'authorizes admin' do
      sign_in(user)
      put :update, params: { id: 1 }, as: :json
      expect(response.code).to eql('403')
    end

    it 'updates user as manager' do
      sign_in(manager)
      tag = create(:tag, :with_project)
      new_name = 'new name'
      tag_params = { name: new_name, project_name: tag.project.name }

      put :update, params: { id: tag.id, tag: tag_params }, as: :json

      expect(response.code).to eql('204')
      expect(tag.reload.name).to eql(new_name)
      expect(response.body).to eq('')
    end

    it 'changes active' do
      sign_in(manager)
      tag = create(:tag, :with_project)
      tag_params = { name: tag.name, project_name: tag.project.name, active: false }

      put :update, params: { id: tag.id, tag: tag_params }, as: :json

      expect(response.code).to eql('204')
      expect(tag.reload.discarded?).to eql(true)
    end
  end
end
