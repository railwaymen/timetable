# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::WorkTimesController, type: :controller do
  include WorkTimeHelper
  render_views
  let(:user) { create(:user) }
  let(:admin) { create(:admin) }
  let(:manager) { create(:manager) }
  let(:body) { SecureRandom.hex }
  let(:starts_at) { Time.zone.now.beginning_of_day + 2.hours }
  let(:ends_at) { Time.zone.now.beginning_of_day + 4.hours }

  def work_time_response(work_time)
    work_time.attributes.slice('id', 'updated_by_admin', 'project_id', 'starts_at', 'ends_at', 'duration', 'body', 'task', 'user_id')
             .merge(task_preview: task_preview_helper(work_time.task))
             .merge(date: work_time.starts_at.to_date,
                    project: { name: work_time.project.name,
                               color: work_time.project.color,
                               lunch: work_time.project.lunch,
                               work_times_allows_task: work_time.project.work_times_allows_task })
  end

  def full_work_time_response(work_time)
    work_time_response(work_time).merge(versions: []).merge(sum_duration: 7200)
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

      worker = FactoryGirl.create :user
      belonged_project = FactoryGirl.create :project, leader_id: user.id
      project = FactoryGirl.create :project

      work_time = FactoryGirl.create :work_time, user: worker, project: belonged_project, starts_at: Time.current - 30.minutes, ends_at: Time.current - 25.minutes
      user_work_time = FactoryGirl.create :work_time, user: user, project: project, starts_at: Time.current - 30.minutes, ends_at: Time.current - 25.minutes
      FactoryGirl.create :work_time, user: worker, project: project, starts_at: Time.current - 25.minutes, ends_at: Time.current - 20.minutes

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
            task_preview: task_preview_helper(work_time.task),
            user_id: work_time.user_id,
            project: {
              id: work_time.project.id,
              name: work_time.project.name,
              color: work_time.project.color,
              work_times_allows_task: work_time.project.work_times_allows_task,
              lunch: work_time.project.lunch
            },
            date: work_time.date
          }
        ].to_json

        get :index, params: { user_id: worker.id, project_id: belonged_project.id }, format: :json

        expect(response.body).to eq expected_work_times_json
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
            task_preview: task_preview_helper(work_time.task),
            user_id: user_work_time.user_id,
            project: {
              id: user_work_time.project.id,
              name: user_work_time.project.name,
              color: user_work_time.project.color,
              work_times_allows_task: work_time.project.work_times_allows_task,
              lunch: work_time.project.lunch
            },
            date: user_work_time.date
          }
        ].to_json

        get :index, params: { project_id: project.id }, format: :json

        expect(response.body).to eq expected_user_work_times_json
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
      expect(response.body).to be_json_eql(full_work_time_response(work_time).to_json)
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
      project = create(:project)
      put :update, params: { id: work_time.id, work_time: { project_id: project.id, body: body, starts_at: work_time.starts_at + 1.hour } }, format: :json
      expect(response.code).to eql('200')
      expect(work_time.reload.body).to eql(body)
      expect(work_time.project_id).to eql(project.id)
      expect(work_time.starts_at).to eql(starts_at + 1.hour)
      expect(work_time.ends_at).to eql(ends_at)
      expect(response.body).to be_json_eql(work_time_response(work_time).to_json)
    end

    it 'updates work time and increases work time' do
      sign_in(user)
      starts_at = Time.zone.now.beginning_of_day
      ends_at = Time.zone.now.beginning_of_day + 2.hours
      work_time = create(:work_time, starts_at: starts_at, ends_at: ends_at, user: user)
      project = create(:project)
      put :update, params: { id: work_time.id, work_time: { project_id: project.id, body: body, ends_at: work_time.ends_at + 1.hour } }, format: :json
      expect(response.code).to eql('200')
      expect(work_time.reload.body).to eql(body)
      expect(work_time.project_id).to eql(project.id)
      expect(work_time.starts_at).to eql(starts_at)
      expect(work_time.ends_at).to eql(ends_at + 1.hour)
      expect(response.body).to be_json_eql(work_time_response(work_time).to_json)
    end

    it 'updates work time as admin' do
      sign_in(admin)
      work_time = create(:work_time, user: user)
      project = create(:project)
      put :update, params: { id: work_time.id, work_time: { project_id: project.id, body: body, starts_at: starts_at, ends_at: ends_at } }, format: :json
      expect(response.code).to eql('200')
      expect(work_time.reload.body).to eql(body)
      expect(work_time.updated_by_admin).to be true
      expect(work_time.project_id).to eql(project.id)
      expect(work_time.starts_at).to eql(starts_at)
      expect(work_time.ends_at).to eql(ends_at)
      expect(response.body).to be_json_eql(work_time_response(work_time).to_json)
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
      expect(work_time.reload.active).to be false
      expect(response.body).to eq('')
    end

    it 'destroys work time as admin' do
      sign_in(admin)
      work_time = create(:work_time)
      delete :destroy, params: { id: work_time.id }, format: :json
      expect(response.code).to eql('204')
      expect(work_time.reload.active).to be false
      expect(work_time.updated_by_admin).to be true
      expect(response.body).to eq('')
    end
  end
end
