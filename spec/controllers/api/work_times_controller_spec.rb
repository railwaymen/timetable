# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::WorkTimesController, type: :controller do
  include WorkTimeHelper
  let(:user) { create(:user) }
  let(:admin) { create(:user, :admin) }
  let(:manager) { create(:user, :manager) }
  let(:project) { create(:project) }
  let(:body) { SecureRandom.hex }
  let(:starts_at) { Time.zone.now.beginning_of_day + 2.hours }
  let(:ends_at) { Time.zone.now.beginning_of_day + 4.hours }

  def work_time_response(work_time)
    work_time.attributes.slice('id', 'updated_by_admin', 'project_id', 'starts_at', 'ends_at', 'duration', 'body', 'task', 'tag', 'user_id')
             .merge(task_preview: task_preview_helper(work_time.task), editable: !work_time.project.accounting?)
             .merge(date: work_time.starts_at.to_date,
                    project: { name: work_time.project.name,
                               color: work_time.project.color,
                               lunch: work_time.project.lunch,
                               accounting: work_time.project.accounting?,
                               count_duration: work_time.project.count_duration,
                               taggable: work_time.project.tags_enabled?,
                               work_times_allows_task: work_time.project.work_times_allows_task })
  end

  describe '#index' do
    it 'authenticates user' do
      get :index, format: :json
      expect(response.code).to eql('401')
    end

    it 'returns work times' do
      sign_in(user)
      work_time = create(:work_time, user: user)
      get :index, format: :json

      expect(response.code).to eql('200')
      expect(response.body).to be_json_eql([work_time_response(work_time)].to_json)
    end

    it 'correct filter data for leader' do
      sign_in user

      worker = FactoryBot.create :user
      belonged_project = FactoryBot.create :project, leader_id: user.id
      project = FactoryBot.create :project

      work_time = FactoryBot.create :work_time, user: worker, project: belonged_project, starts_at: Time.current - 30.minutes, ends_at: Time.current - 25.minutes
      user_work_time = FactoryBot.create :work_time, user: user, project: project, starts_at: Time.current - 30.minutes, ends_at: Time.current - 25.minutes
      FactoryBot.create :work_time, user: worker, project: project, starts_at: Time.current - 25.minutes, ends_at: Time.current - 20.minutes

      aggregate_failures 'display data for own project' do
        expected_work_times_json = [
          {
            id: work_time.id,
            updated_by_admin: work_time.updated_by_admin,
            project_id: work_time.project_id,
            starts_at: work_time.starts_at,
            ends_at: work_time.ends_at,
            duration: work_time.duration,
            body: work_time.body,
            task: work_time.task,
            tag: work_time.tag,
            task_preview: task_preview_helper(work_time.task),
            user_id: work_time.user_id,
            editable: !work_time.project.accounting?,
            project: {
              id: work_time.project.id,
              name: work_time.project.name,
              color: work_time.project.color,
              accounting: work_time.project.accounting?,
              work_times_allows_task: work_time.project.work_times_allows_task,
              lunch: work_time.project.lunch,
              count_duration: work_time.project.count_duration,
              taggable: work_time.project.tags_enabled?
            },
            date: work_time.starts_at.to_date
          }
        ].to_json

        get :index, params: { user_id: worker.id, project_id: belonged_project.id }, format: :json

        expect(response.body).to be_json_eql expected_work_times_json
      end

      aggregate_failures 'won\'t display data from other project' do
        get :index, params: { user_id: worker.id, project_id: project.id }, format: :json

        expect(response.body).to eq [].to_json
      end

      aggregate_failures 'correctly displays own data' do
        expected_user_work_times_json = [
          {
            id: user_work_time.id,
            updated_by_admin: user_work_time.updated_by_admin,
            project_id: user_work_time.project_id,
            starts_at: user_work_time.starts_at,
            ends_at: user_work_time.ends_at,
            duration: user_work_time.duration,
            body: user_work_time.body,
            task: user_work_time.task,
            tag: work_time.tag,
            task_preview: task_preview_helper(work_time.task),
            user_id: user_work_time.user_id,
            editable: !work_time.project.accounting?,
            project: {
              id: user_work_time.project.id,
              name: user_work_time.project.name,
              color: user_work_time.project.color,
              accounting: work_time.project.accounting?,
              work_times_allows_task: work_time.project.work_times_allows_task,
              lunch: work_time.project.lunch,
              count_duration: work_time.project.count_duration,
              taggable: work_time.project.tags_enabled?
            },
            date: user_work_time.starts_at.to_date
          }
        ].to_json

        get :index, params: { project_id: project.id }, format: :json

        expect(response.body).to be_json_eql expected_user_work_times_json
      end
    end

    it 'filters by user_id when user is an admin' do
      sign_in(admin)
      work_time = create(:work_time)
      get :index, params: { user_id: work_time.user_id }, format: :json

      expect(response.code).to eql('200')
      expect(response.body).to be_json_eql([work_time_response(work_time)].to_json)
    end
  end

  describe '#show' do
    it 'authenticates user' do
      get :show, params: { id: 1 }, format: :json
      expect(response.code).to eql('401')
    end

    it 'returns work time' do
      sign_in(user)
      work_time = create(:work_time, user: user)
      get :show, params: { id: work_time.id }, format: :json
      expect(response.code).to eql('200')
      expect(response.body).to be_json_eql(work_time_response(work_time).merge(sum_duration: work_time.duration, versions: []).to_json)
    end

    it 'returns work time versions' do
      sign_in(user)

      PaperTrail.enabled = true
      PaperTrail.request(whodunnit: admin.id) do
        work_time = create(:work_time, user: user)
        version1 = work_time_response(work_time).merge(updated_by_admin: false, event: :create, created_at: work_time.created_at,
                                                       updated_by: admin.accounting_name,
                                                       changeset: %i[id user_id project_id starts_at ends_at duration body created_at updated_at creator_id date])
        work_time.update! body: 'New body'
        version2 = work_time_response(work_time).merge(updated_by_admin: false, event: :update, created_at: work_time.created_at, updated_by: admin.accounting_name, changeset: %i[body updated_at])

        get :show, params: { id: work_time.id }, format: :json
        expect(response.code).to eql('200')
        expect(response.body).to be_json_eql(work_time_response(work_time).merge(sum_duration: work_time.duration, versions: [version1, version2]).to_json)
      end
      PaperTrail.enabled = false
    end
  end

  describe '#create' do
    it 'authenticates user' do
      post :create, format: :json
      expect(response.code).to eql('401')
    end

    it 'creates work time' do
      sign_in(user)
      project = create(:project)
      post :create, params: { work_time: { project_id: project.id, body: body, starts_at: starts_at, ends_at: ends_at } }, format: :json
      expect(response.code).to eql('200')
      work_time = user.work_times.first!
      expect(work_time.body).to eql(body)
      expect(work_time.starts_at).to eql(starts_at)
      expect(work_time.ends_at).to eql(ends_at)
      expect(response.body).to be_json_eql(work_time_response(work_time).to_json)
    end

    it 'creates work time for other user by admin' do
      sign_in(admin)
      other_user = create(:user)
      project = create(:project)
      post :create, params: { work_time: { user_id: other_user.id, project_id: project.id, body: body, starts_at: starts_at, ends_at: ends_at } }, format: :json
      expect(response.code).to eql('200')
      work_time = other_user.work_times.first!
      expect(work_time.updated_by_admin).to be true
      expect(work_time.body).to eql(body)
      expect(work_time.starts_at).to eql(starts_at)
      expect(work_time.ends_at).to eql(ends_at)
      expect(response.body).to be_json_eql(work_time_response(work_time).to_json)
    end

    it 'does not create work time when invalid task url' do
      module ExternalAuthStrategy
        class Sample < Base; def self.from_data(*args); end; end
      end
      project = create(:project, :external_integration_enabled)
      create(:external_auth, user: user, provider: 'Sample')
      sign_in(user)
      strategy_double = double('strategy')
      allow(ExternalAuthStrategy::Sample).to receive(:from_data) { strategy_double }
      expect(strategy_double).to receive(:integration_payload) { nil }
      post :create, params: { work_time: { project_id: project.id, body: body, starts_at: starts_at, ends_at: ends_at, task: 'http://example.com' } }, format: :json
      expect(response.code).to eql('422')
    end

    it 'creates integration payload' do
      module ExternalAuthStrategy
        class Sample < Base; def self.from_data(*args); end; end
      end
      project = create(:project, :external_integration_enabled)
      create(:external_auth, user: user, provider: 'Sample')
      sign_in(user)
      strategy_double = double('strategy')
      allow(ExternalAuthStrategy::Sample).to receive(:from_data) { strategy_double }
      expect(strategy_double).to receive(:integration_payload) { { 'task_id' => 1 } }
      expect(UpdateExternalAuthWorker).to receive(:perform_async)
      post :create, params: { work_time: { project_id: project.id, body: body, starts_at: starts_at, ends_at: ends_at, task: 'http://example.com' } }, format: :json
      expect(response.code).to eql('200')
    end
  end

  describe '#create_filling_gaps' do
    it 'creates correctly when no task in range' do
      sign_in(user)
      project = create(:project)
      post :create_filling_gaps, params: { work_time: { project_id: project.id, body: body, starts_at: starts_at, ends_at: ends_at } }, format: :json
      expect(response.code).to eql('200')
      work_time = user.work_times.first!
      expect(work_time.body).to eql(body)
      expect(work_time.starts_at).to eql(starts_at)
      expect(work_time.ends_at).to eql(ends_at)
      expect(response.body).to be_json_eql([work_time].map(&method(:work_time_response)).to_json)
    end

    it 'creates correctly when one task in range' do
      sign_in(user)
      project = create(:project)
      create(:work_time, user: user, starts_at: starts_at + 30.minutes, ends_at: ends_at - 30.minutes)
      expect do
        post :create_filling_gaps, params: { work_time: { project_id: project.id, body: body, starts_at: starts_at, ends_at: ends_at } }, format: :json
      end.to change(user.work_times, :count).by(2)
      expect(response.code).to eql('200')
      expect(response.body).to be_json_eql(WorkTime.last(2).map(&method(:work_time_response)).to_json)
    end

    it 'creates correctly when many tasks in range' do
      sign_in(user)
      project = create(:project)
      create(:work_time, user: user, starts_at: starts_at + 15.minutes, ends_at: starts_at + 30.minutes)
      create(:work_time, user: user, starts_at: starts_at + 40.minutes, ends_at: starts_at + 50.minutes)
      create(:work_time, user: user, starts_at: starts_at + 50.minutes, ends_at: starts_at + 60.minutes) # there should be no gaps between second and third wt
      expect do
        post :create_filling_gaps, params: { work_time: { project_id: project.id, body: body, starts_at: starts_at, ends_at: ends_at } }, format: :json
      end.to change(user.work_times, :count).by(3)
      expect(response.code).to eql('200')
      expect(response.body).to be_json_eql(WorkTime.last(3).map(&method(:work_time_response)).to_json)
    end

    it 'does not create work time when invalid task url' do
      module ExternalAuthStrategy
        class Sample < Base; def self.from_data(*args); end; end
      end
      project = create(:project, :external_integration_enabled)
      create(:external_auth, user: user, provider: 'Sample')
      sign_in(user)
      strategy_double = double('strategy')
      allow(ExternalAuthStrategy::Sample).to receive(:from_data) { strategy_double }
      expect(strategy_double).to receive(:integration_payload) { nil }
      expect do
        post :create_filling_gaps, params: { work_time: { project_id: project.id, body: body, starts_at: starts_at, ends_at: ends_at, task: 'http://example.com' } }, format: :json
      end.not_to change(user.work_times, :count)
      expect(response.code).to eql('422')
    end

    it 'updates external service whan valid task' do
      module ExternalAuthStrategy
        class Sample < Base; def self.from_data(*args); end; end
      end
      project = create(:project, :external_integration_enabled)
      create(:external_auth, user: user, provider: 'Sample')
      sign_in(user)
      strategy_double = double('strategy')
      allow(ExternalAuthStrategy::Sample).to receive(:from_data) { strategy_double }
      expect(strategy_double).to receive(:integration_payload) { { 'task_id' => 1 } }
      expect(UpdateExternalAuthWorker).to receive(:perform_async)
      post :create_filling_gaps, params: { work_time: { project_id: project.id, body: body, starts_at: starts_at, ends_at: ends_at, task: 'http://example.com' } }, format: :json
      expect(response.code).to eql('200')
    end

    it 'creates when admin' do
      sign_in(admin)
      other_user = create(:user)
      project = create(:project)
      post :create_filling_gaps, params: { work_time: { user_id: other_user.id, project_id: project.id, body: body, starts_at: starts_at, ends_at: ends_at } }, format: :json
      expect(response.code).to eql('200')
      work_time = other_user.work_times.first!
      expect(work_time.updated_by_admin).to be true
      expect(work_time.body).to eql(body)
      expect(work_time.starts_at).to eql(starts_at)
      expect(work_time.ends_at).to eql(ends_at)
      expect(response.body).to be_json_eql([work_time_response(work_time)].to_json)
    end

    it 'does not create work time when invalid params' do
      sign_in(user)
      project = create(:project)
      expect do
        post :create_filling_gaps, params: { work_time: { project_id: project.id, body: body, starts_at: starts_at, ends_at: starts_at } }, format: :json
      end.not_to change(user.work_times, :count)
      expect(response.code).to eql('422')
    end

    it 'does not create when no gaps to fill' do
      sign_in(user)
      project = create(:project)
      create(:work_time, user: user, starts_at: starts_at, ends_at: ends_at)
      expect do
        post :create_filling_gaps, params: { work_time: { project_id: project.id, body: body, starts_at: starts_at, ends_at: ends_at } }, format: :json
      end.not_to change(user.work_times, :count)
      expect(response.code).to eql('422')
    end
  end

  describe '#update' do
    it 'authenticates user' do
      put :update, params: { id: 1 }, format: :json
      expect(response.code).to eql('401')
    end

    it 'updates work time and decrease work time' do
      sign_in(user)
      starts_at = Time.zone.now.beginning_of_day
      ends_at = Time.zone.now.beginning_of_day + 2.hours
      work_time = create(:work_time, starts_at: starts_at, ends_at: ends_at, user: user)
      put :update, params: { id: work_time.id, work_time: { body: body, starts_at: work_time.starts_at + 1.hour } }, format: :json
      expect(response.code).to eql('200')
      expect(work_time.reload.body).to eql(body)
      expect(work_time.starts_at).to eql(starts_at + 1.hour)
      expect(work_time.ends_at).to eql(ends_at)
      expect(response.body).to be_json_eql(work_time_response(work_time).to_json)
    end

    it 'updates work time and increases work time' do
      sign_in(user)
      starts_at = Time.zone.now.beginning_of_day
      ends_at = Time.zone.now.beginning_of_day + 2.hours
      work_time = create(:work_time, starts_at: starts_at, ends_at: ends_at, user: user)
      put :update, params: { id: work_time.id, work_time: { body: body, ends_at: work_time.ends_at + 1.hour } }, format: :json
      expect(response.code).to eql('200')
      expect(work_time.reload.body).to eql(body)
      expect(work_time.starts_at).to eql(starts_at)
      expect(work_time.ends_at).to eql(ends_at + 1.hour)
      expect(response.body).to be_json_eql(work_time_response(work_time).to_json)
    end

    it 'updates work time as admin' do
      sign_in(admin)
      work_time = create(:work_time, user: user)
      put :update, params: { id: work_time.id, work_time: { body: body, starts_at: starts_at, ends_at: ends_at } }, format: :json
      expect(response.code).to eql('200')
      expect(work_time.reload.body).to eql(body)
      expect(work_time.updated_by_admin).to be true
      expect(work_time.starts_at).to eql(starts_at)
      expect(work_time.ends_at).to eql(ends_at)
      expect(response.body).to be_json_eql(work_time_response(work_time).to_json)
    end

    it 'does not allow to update vacation project for regular user' do
      sign_in(user)
      vacation = create(:project, :vacation)
      work_time = create(:work_time, project: vacation, user: user)
      expect do
        put :update, params: { id: work_time.id, work_time: { starts_at: starts_at } }, format: :json
      end.to raise_error(Pundit::NotAuthorizedError)
    end
  end

  describe '#destroy' do
    it 'authenticates user' do
      delete :destroy, params: { id: 1 }, format: :json
      expect(response.code).to eql('401')
    end

    it 'destroys work time' do
      sign_in(user)
      work_time = create(:work_time, user: user)
      delete :destroy, params: { id: work_time.id }, format: :json
      expect(response.code).to eql('204')
      expect(work_time.reload.discarded?).to be true
      expect(response.body).to eq('')
    end

    it 'destroys work time as admin' do
      sign_in(admin)
      work_time = create(:work_time)
      delete :destroy, params: { id: work_time.id }, format: :json
      expect(response.code).to eql('204')
      expect(work_time.reload.discarded?).to be true
      expect(work_time.updated_by_admin).to be true
      expect(response.body).to eq('')
    end

    it 'does not allow to destroy work time older that 3 business days for regular user' do
      sign_in(user)
      work_time = create(:work_time, starts_at: 10.days.ago.beginning_of_day + 8.hours, ends_at: 10.days.ago.beginning_of_day + 10.hours, user: user)
      delete :destroy, params: { id: work_time.id }, format: :json
      expect(response.code).to eql('422')
      expect(response.body).to include_json({ error: :too_old }.to_json).at_path('errors/starts_at')
      expect(work_time.reload.discarded?).to be false
    end
  end

  describe 'GET #search' do
    it 'authenticates user' do
      get :search, params: { query: 'query' }, format: :json
      expect(response.code).to eql('401')
    end

    it 'returns only work times with "Search query" in body' do
      sign_in(user)
      work_time = create(:work_time, user: user, body: 'Search query test')
      create(:work_time, user: user)
      get :search, params: { query: 'Search query' }, format: :json

      expect(response.code).to eql('200')
      expect(response.body).to be_json_eql([work_time_response(work_time)].to_json)
    end

    it 'returns only work times with "TIM-TEST" in task' do
      sign_in(user)
      work_time = create(:work_time, user: user, task: 'https://railwaymen.atlassian.net/browse/TIM-TEST')
      create(:work_time, user: user)
      get :search, params: { query: 'TIM-TEST' }, format: :json

      expect(response.code).to eql('200')
      expect(response.body).to be_json_eql([work_time_response(work_time)].to_json)
    end

    it 'correct filter data for leader' do
      sign_in user

      worker = FactoryBot.create :user
      belonged_project = FactoryBot.create :project, leader_id: user.id
      project = FactoryBot.create :project

      work_time = FactoryBot.create :work_time, user: worker, project: belonged_project, starts_at: Time.current - 30.minutes, ends_at: Time.current - 25.minutes, body: 'query1'
      user_work_time = FactoryBot.create :work_time, user: user, project: project, starts_at: Time.current - 30.minutes, ends_at: Time.current - 25.minutes, body: 'query2'
      FactoryBot.create :work_time, user: worker, project: project, starts_at: Time.current - 25.minutes, ends_at: Time.current - 20.minutes, body: 'query3'

      aggregate_failures 'display data for own project' do
        expected_work_times_json = [
          {
            id: work_time.id,
            updated_by_admin: work_time.updated_by_admin,
            project_id: work_time.project_id,
            starts_at: work_time.starts_at,
            ends_at: work_time.ends_at,
            duration: work_time.duration,
            date: work_time.starts_at.to_date,
            body: work_time.body,
            task: work_time.task,
            tag: work_time.tag,
            task_preview: task_preview_helper(work_time.task),
            user_id: work_time.user_id,
            editable: !work_time.project.accounting?,
            project: {
              id: work_time.project.id,
              name: work_time.project.name,
              color: work_time.project.color,
              work_times_allows_task: work_time.project.work_times_allows_task,
              lunch: work_time.project.lunch,
              count_duration: work_time.project.count_duration,
              accounting: work_time.project.accounting?,
              taggable: work_time.project.tags_enabled?
            }
          }
        ].to_json

        get :search, params: { user_id: worker.id, query: 'query' }, format: :json

        expect(response.body).to be_json_eql expected_work_times_json
      end

      aggregate_failures 'correctly displays own data' do
        expected_user_work_times_json = [
          {
            id: user_work_time.id,
            updated_by_admin: user_work_time.updated_by_admin,
            project_id: user_work_time.project_id,
            starts_at: user_work_time.starts_at,
            ends_at: user_work_time.ends_at,
            duration: user_work_time.duration,
            body: user_work_time.body,
            task: user_work_time.task,
            tag: work_time.tag,
            task_preview: task_preview_helper(work_time.task),
            user_id: user_work_time.user_id,
            editable: !work_time.project.accounting?,
            project: {
              id: user_work_time.project.id,
              name: user_work_time.project.name,
              color: user_work_time.project.color,
              accounting: work_time.project.accounting?,
              work_times_allows_task: work_time.project.work_times_allows_task,
              lunch: work_time.project.lunch,
              count_duration: work_time.project.count_duration,
              taggable: work_time.project.tags_enabled?
            },
            date: user_work_time.starts_at.to_date
          }
        ].to_json

        get :search, params: { query: 'query' }, format: :json

        expect(response.body).to be_json_eql expected_user_work_times_json
      end
    end

    it 'filters by user_id when user is an admin' do
      sign_in(admin)
      work_time = create(:work_time, body: 'user id test')
      create(:work_time, user_id: work_time.user_id)
      get :search, params: { user_id: work_time.user_id, query: 'user id' }, format: :json

      expect(response.code).to eql('200')
      expect(response.body).to be_json_eql([work_time_response(work_time)].to_json)
    end
  end
end
