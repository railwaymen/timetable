# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::ProjectsController do
  before(:each) { I18n.locale = :pl }

  render_views
  let(:user) { create(:user) }
  let(:admin) { create(:user, :admin) }
  let(:manager) { create(:user, :manager) }
  let(:project_name) { SecureRandom.hex }
  let(:tags_list) { WorkTime.tags.keys }

  def full_project_response(project)
    project.attributes.slice('id', 'name', 'work_times_allows_task', 'external_integration_enabled', 'color', 'leader_id').merge(active: project.kept?)
  end

  describe '#index' do
    it 'authenticates user' do
      get :index, format: :json
      expect(response.code).to eql('401')
    end

    it 'returns projects' do
      sign_in(user)
      project = create(:project, :with_leader)
      FactoryBot.create :work_time, project: project, user: user, starts_at: Time.current - 40.minutes, ends_at: Time.current - 30.minutes
      project_rate = ProjectRateQuery.new.results.first
      get :index, format: :json
      project_user = project_rate.users.first

      expected_json = [
        {
          color: project_rate.color,
          name: project_rate.name,
          project_id: project_rate.project_id,
          leader_first_name: project.leader.first_name,
          leader_last_name: project.leader.last_name,
          users: [
            { id: project_user.id, first_name: project_user.first_name, last_name: project_user.last_name }
          ]
        }
      ].to_json

      expect(response.code).to eql('200')
      expect(response.body).to be_json_eql(expected_json)
    end

    it 'filters by active' do
      sign_in(user)
      active_project = create(:project, :with_leader)

      FactoryBot.create :work_time, project: active_project, user: user, starts_at: Time.current - 40.minutes, ends_at: Time.current - 30.minutes

      active_project_rate = ProjectRateQuery.new.results.first
      project_user = active_project_rate.users.first

      expected_active_json = [
        {
          color: active_project_rate.color,
          name: active_project_rate.name,
          project_id: active_project_rate.project_id,
          leader_first_name: active_project.leader.first_name,
          leader_last_name: active_project.leader.last_name,
          users: [
            { id: project_user.id, first_name: project_user.first_name, last_name: project_user.last_name }
          ]
        }
      ].to_json

      get :index, format: :json

      expect(response.code).to eql('200')
      expect(response.body).to be_json_eql(expected_active_json)
    end

    it 'hides internal projects' do
      sign_in(user)
      internal_project = create(:project, internal: true)

      FactoryBot.create :work_time, project: internal_project, starts_at: Time.current - 40.minutes, ends_at: Time.current - 30.minutes, user: user

      get :index, format: :json

      expect(response.code).to eql('200')
      expect(response.body).to be_json_eql([].to_json)
    end
  end

  describe 'list' do
    it 'correctly display active projects' do
      sign_in user
      project = FactoryBot.create :project
      FactoryBot.create :project, :discarded

      expected_json = [
        {
          id: project.id,
          name: project.name,
          color: project.color,
          active: project.kept?,
          leader_id: project.leader_id
        }
      ].to_json

      get :list, format: :json

      expect(response.body).to be_json_eql(expected_json)
    end

    it 'correctly display all projects' do
      sign_in user
      project = FactoryBot.create :project
      inactive_project = FactoryBot.create :project, :discarded

      projects_json = [
        {
          id: project.id,
          name: project.name,
          color: project.color,
          active: project.kept?,
          leader_id: project.leader_id
        },
        {
          id: inactive_project.id,
          name: inactive_project.name,
          color: inactive_project.color,
          active: inactive_project.kept?,
          leader_id: inactive_project.leader_id
        }
      ].to_json

      get :list, params: { display: 'all' }, format: :json

      expect(response.body).to be_json_eql(projects_json)
    end

    describe 'filters' do
      context 'all' do
        it 'return all possible records' do
          sign_in admin
          FactoryBot.create :project, :discarded
          FactoryBot.create :project

          get :list, params: { display: 'all' }, format: :json

          expected_json = Project.all.map do |project|
            {
              id: project.id,
              name: project.name,
              color: project.color,
              active: project.kept?,
              leader_id: project.leader_id
            }
          end.to_json

          expect(response.body).to be_json_eql(expected_json)
        end
      end

      context 'active' do
        it 'return all possible records' do
          sign_in admin
          FactoryBot.create :project, :discarded
          FactoryBot.create :project

          get :list, params: { display: 'active' }, format: :json

          expected_json = Project.kept.map do |project|
            {
              id: project.id,
              name: project.name,
              color: project.color,
              active: project.kept?,
              leader_id: project.leader_id
            }
          end.to_json

          expect(response.body).to be_json_eql(expected_json)
        end
      end

      context 'inactive' do
        it 'return all possible records' do
          sign_in admin
          FactoryBot.create :project, :discarded
          FactoryBot.create :project

          get :list, params: { display: 'inactive' }, format: :json

          expected_json = Project.discarded.map do |project|
            {
              id: project.id,
              name: project.name,
              color: project.color,
              active: project.kept?,
              leader_id: project.leader_id
            }
          end.to_json

          expect(response.body).to be_json_eql(expected_json)
        end
      end
    end
  end

  describe '#simple' do
    def project_response(project)
      project.attributes.slice(
        'id', 'name', 'internal',
        'work_times_allows_task', 'color', 'autofill',
        'lunch', 'count_duration'
      ).merge(active: project.kept?, taggable: project.taggable?)
    end

    it 'authenticates user' do
      get :simple, format: :json
      expect(response.code).to eql('401')
    end

    it 'returns only basic project information' do
      sign_in(user)
      project = create(:project)
      get :simple, format: :json
      expect(response.code).to eql('200')
      expect(response.body).to be_json_eql([project_response(project)].to_json)
    end
  end

  describe '#show' do
    it 'authenticates user' do
      get :show, params: { id: 1 }, format: :json
      expect(response.code).to eql('401')
    end

    it 'returns info for leader' do
      sign_in user
      project = FactoryBot.create :project, leader_id: user.id

      get :show, params: { id: project.id }

      expected_json = {
        id: project.id,
        name: project.name,
        work_times_allows_task: project.work_times_allows_task,
        external_integration_enabled: project.external_integration_enabled,
        color: project.color,
        active: project.kept?,
        leader_id: project.leader_id,
        leader: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email
        }
      }.to_json

      expect(response.code).to eq '200'
      expect(response.body).to be_json_eql(expected_json)
    end

    it 'returns info for admin' do
      sign_in FactoryBot.create :user, admin: true
      project = FactoryBot.create :project

      get :show, params: { id: project.id }

      expected_json = {
        id: project.id,
        name: project.name,
        work_times_allows_task: project.work_times_allows_task,
        external_integration_enabled: project.external_integration_enabled,
        color: project.color,
        active: project.kept?,
        leader_id: project.leader_id
      }.to_json

      expect(response.code).to eq '200'
      expect(response.body).to be_json_eql(expected_json)
    end

    it 'returns info for manager' do
      sign_in FactoryBot.create :user, manager: true
      project = FactoryBot.create :project

      get :show, params: { id: project.id }

      expected_json = {
        id: project.id,
        name: project.name,
        work_times_allows_task: project.work_times_allows_task,
        external_integration_enabled: project.external_integration_enabled,
        color: project.color,
        active: project.kept?,
        leader_id: project.leader_id
      }.to_json

      expect(response.code).to eq '200'
      expect(response.body).to be_json_eql(expected_json)
    end

    it 'returns unauth status for user' do
      sign_in FactoryBot.create :user
      project = FactoryBot.create :project

      get :show, params: { id: project.id }

      expect(response.code).to eq '403'
      expect(response.body).to eq('')
    end
  end

  describe '#create' do
    it 'authenticates user' do
      post :create, format: :json
      expect(response.code).to eql('401')
    end

    it 'authorizes admin or manager' do
      sign_in(user)
      post :create, format: :json
      expect(response.code).to eql('403')
    end

    it 'creates project as admin' do
      sign_in(admin)
      post :create, params: { project: { name: project_name } }, format: :json
      expect(response.code).to eql('200')
      project = Project.find_by name: project_name
      expect(response.body).to be_json_eql(full_project_response(project).to_json)
    end

    it 'creates project as manager' do
      sign_in(manager)
      post :create, params: { project: { name: project_name } }, format: :json
      expect(response.code).to eql('200')
      project = Project.find_by name: project_name
      expect(response.body).to be_json_eql(full_project_response(project).to_json)
    end
  end

  describe '#update' do
    it 'authenticates user' do
      put :update, params: { id: 1 }, format: :json
      expect(response.code).to eql('401')
    end

    it 'authorizes admin or manager' do
      sign_in(user)
      put :update, params: { id: 1 }, format: :json
      expect(response.code).to eql('403')
    end

    it 'updates project as leader' do
      sign_in user
      project = FactoryBot.create :project, leader_id: user.id

      put :update, params: { id: project.id, project: { name: 'test', color: '#5e5e5e' } }, format: :json

      project.reload

      expect(project.name).not_to eq 'test'
      expect(project.color).to eq '#5e5e5e'
    end

    it 'creates project as admin' do
      sign_in(admin)
      project = create(:project)
      put :update, params: { id: project.id, project: { name: project_name, work_times_allows_task: true, external_integration_enabled: true } }, format: :json
      expect(response.code).to eql('204')
      expect(project.reload.name).to eql(project_name)
      expect(project.work_times_allows_task).to eql(true)
      expect(project.external_integration_enabled).to eql(true)
      expect(response.body).to eq('')
    end

    it 'creates project as manager' do
      sign_in(manager)
      project = create(:project)
      put :update, params: { id: project.id, project: { name: project_name, work_times_allows_task: true, external_integration_enabled: true } }, format: :json
      expect(response.code).to eql('204')
      expect(project.reload.name).to eql(project_name)
      expect(project.work_times_allows_task).to eql(true)
      expect(project.external_integration_enabled).to eql(true)
      expect(response.body).to eq('')
    end
  end

  describe '#work_times' do
    context 'range params' do
      it 'returns correct work times' do
        sign_in admin
        time = Time.new(2019, 4, 4).in_time_zone
        project = FactoryBot.create :project

        work_time = FactoryBot.create :work_time, user: user, project: project, starts_at: time, ends_at: time + 30.minutes
        FactoryBot.create :work_time, user: user, project: project, starts_at: Time.zone.now, ends_at: Time.zone.now + 1.hour

        get :work_times, params: { id: project, from: time, to: time + 2.days, user_id: user.id }, format: :json
        expect(response).to be_ok
        parsed_body = JSON.parse(response.body)
        expect(parsed_body.dig('project', 'name')).to eq project.name
        expect(parsed_body['work_times'].map { |wt| wt['id'] }).to match_array([work_time.id])
      end
    end

    context 'no range params' do
      it 'returns work times in current week' do
        sign_in admin
        current_time = Time.zone.now
        project = FactoryBot.create :project

        work_time = FactoryBot.create :work_time, user: user, project: project, starts_at: current_time - 30.minutes, ends_at: current_time - 25.minutes
        FactoryBot.create :work_time, user: user, project: project, starts_at: current_time - 70.days - 8.hours, ends_at: current_time - 70.days - 7.hours

        get :work_times, params: { id: project }, format: :json
        expect(response).to be_ok
        parsed_body = JSON.parse(response.body)
        expect(parsed_body.dig('project', 'name')).to eq project.name
        expect(parsed_body['work_times'].map { |wt| wt['id'] }).to match_array([work_time.id])
      end

      it 'filters out work_times when normal user' do
        sign_in user
        time = Time.new(2019, 4, 4).in_time_zone
        project = FactoryBot.create(:project)

        expect do
          get :work_times, params: { id: project, from: time, to: time + 2.days }, format: :json
        end.to raise_error(ActiveRecord::RecordNotFound)
      end
    end
  end
end
