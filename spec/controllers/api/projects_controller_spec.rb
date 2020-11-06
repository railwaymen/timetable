# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::ProjectsController do
  let(:user) { create(:user) }
  let(:admin) { create(:user, :admin) }
  let(:manager) { create(:user, :manager) }
  let(:project_name) { SecureRandom.hex }

  def milestone_response(milestone)
    milestone.attributes.slice('id', 'name', 'closed', 'starts_on', 'ends_on', 'project_id',
                               'dev_estimate', 'qa_estimate', 'ux_estimate', 'pm_estimate', 'other_estimate', 'external_estimate', 'total_estimate').merge(external_id: milestone.external_id)
  end

  def stats_response(project, work_times)
    project.attributes.slice('color', 'name', 'id').merge(
      leader_name: project.leader&.name,
      users: work_times.map do |work_time|
        { id: work_time.user.id, first_name: work_time.user.first_name, last_name: work_time.user.last_name }
      end
    )
  end

  def index_response(project)
    project.attributes.slice(
      'id', 'name', 'color', 'leader_id'
    ).merge(leader_name: project.leader&.name)
  end

  def full_project_response(project)
    project.attributes.slice('id', 'name', 'work_times_allows_task', 'milestones_import_enabled', 'tags_enabled', 'external_integration_enabled', 'color', 'leader_id').merge(active: project.kept?, external_id: project.external_id)
  end

  describe '#index' do
    it 'authenticates user' do
      get :index, format: :json
      expect(response.code).to eql('401')
    end

    it 'returns only basic project information' do
      sign_in(user)
      project = create(:project)
      get :index, format: :json
      expect(response.code).to eql('200')
      expect(response.body).to be_json_eql([index_response(project)].to_json)
    end
  end

  describe '#stats' do
    it 'authenticates user' do
      get :stats, format: :json
      expect(response.code).to eql('401')
    end

    it 'returns projects' do
      sign_in(user)
      project = create(:project, :with_leader)
      work_time = FactoryBot.create :work_time, project: project, user: user
      expected_json = [stats_response(project, [work_time])].to_json

      get :stats, format: :json
      expect(response.code).to eql('200')
      expect(response.body).to be_json_eql(expected_json)
    end

    it 'filters by active' do
      sign_in(user)
      active_project = create(:project, :with_leader)
      create(:project, :discarded)

      work_time = FactoryBot.create :work_time, project: active_project, user: user

      expected_active_json = [stats_response(active_project, [work_time])].to_json

      get :stats, params: { display: 'active' }, format: :json

      expect(response.code).to eql('200')
      expect(response.body).to be_json_eql(expected_active_json)
    end

    it 'sorts alphabetically by type' do
      sign_in(user)
      project1 = create(:project, name: 'XXX')
      project2 = create(:project, name: 'AAA')

      get :stats, params: { sort: 'alphabetical' }, format: :json

      expect(response.code).to eql('200')
      expect(response.body).to be_json_eql([stats_response(project2, []), stats_response(project1, [])].to_json)
    end

    it 'filters by type' do
      sign_in(user)
      internal_project = create(:project, internal: true)

      FactoryBot.create :work_time, project: internal_project, starts_at: Time.current - 40.minutes, ends_at: Time.current - 30.minutes, user: user

      get :stats, params: { type: 'commercial' }, format: :json

      expect(response.code).to eql('200')
      expect(response.body).to be_json_eql([].to_json)
    end
  end

  describe '#current_milestones' do
    it 'returns milestones with estimates' do
      sign_in(user)

      milestone1 = create(:milestone, starts_on: 10.days.ago, ends_on: 20.days.from_now)
      milestone2 = create(:milestone)
      work_time = create(:work_time, project: milestone1.project)

      expected_response = [
        milestone_response(milestone1).merge(work_times_duration: work_time.duration),
        milestone_response(milestone2).merge(work_times_duration: nil)
      ]

      get :current_milestones, params: { project_ids: [milestone1.project_id, milestone2.project_id].join(',') }, format: :json
      expect(response.body).to be_json_eql(expected_response.to_json)
    end
  end

  describe '#simple' do
    def project_response(project)
      project.attributes.slice(
        'id', 'name', 'internal',
        'work_times_allows_task', 'color', 'autofill',
        'lunch', 'count_duration'
      ).merge(active: project.kept?, taggable: project.tags_enabled?, accounting: project.accounting?)
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

  describe '#tags' do
    it 'returns basic tags' do
      sign_in(user)

      get :tags, format: :json

      expect(response.code).to eql('200')
      expect(response.body).to be_json_eql(%w[dev im cc res].to_json)
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
        tags_enabled: project.tags_enabled?,
        milestones_import_enabled: project.milestones_import_enabled,
        external_id: project.external_id,
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
        tags_enabled: project.tags_enabled?,
        milestones_import_enabled: project.milestones_import_enabled,
        external_id: project.external_id,
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
        tags_enabled: project.tags_enabled?,
        milestones_import_enabled: project.milestones_import_enabled,
        external_id: project.external_id,
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
      post :create, params: { project: { name: project_name, tags_enabled: false } }, format: :json
      expect(response.code).to eql('200')
      project = Project.find_by name: project_name
      expect(project.tags_enabled).to be(false)
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

    it 'updates project as admin' do
      sign_in(admin)
      project = create(:project)
      put :update, params: { id: project.id, project: { name: project_name, work_times_allows_task: true, external_id: '11', external_integration_enabled: true } }, format: :json
      expect(response.code).to eql('204')
      expect(project.reload.name).to eql(project_name)
      expect(project.work_times_allows_task).to eql(true)
      expect(project.external_integration_enabled).to eql(true)
      expect(project.external_id).to eql('11')
      expect(response.body).to eq('')
    end

    it 'updates project as manager' do
      sign_in(manager)
      project = create(:project)
      put :update, params: { id: project.id, project: { name: project_name, work_times_allows_task: true, external_id: '11', external_integration_enabled: true } }, format: :json
      expect(response.code).to eql('204')
      expect(project.reload.name).to eql(project_name)
      expect(project.work_times_allows_task).to eql(true)
      expect(project.external_integration_enabled).to eql(true)
      expect(project.external_id).to eql('11')
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
        FactoryBot.create :work_time, user: user, project: project, starts_at: 70.days.ago.beginning_of_day + 8.hours, ends_at: 70.days.ago.beginning_of_day + 9.hours

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
