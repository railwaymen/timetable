# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::Reports::WorkTimesController do
  render_views
  let(:user) { create(:user) }
  let(:manager) { create(:manager) }
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

    it 'returns work times grouped by projects for manager' do
      sign_in(manager)
      user = create(:user)
      project = create(:project)
      create(:work_time, user: user, project: project, starts_at: '2016-01-05 08:00:00', ends_at: '2016-01-05 10:00:00')
      get :index, params: { from: '2016-01-01 00:00:00', to: '2016-01-31 23:59:59' }, format: :json

      expect(response.code).to eql('200')
      expect(response.body).to be_json_eql([{ project_id: project.id, project_name: project.name, project_duration: 2.hours,
                                              user_name: user.to_s, user_id: user.id, duration: 2.hours }].to_json)
    end

    it 'returns work times grouped by projects for admin' do
      sign_in(admin)
      user = create(:user)
      project = create(:project)
      create(:work_time, user: user, project: project, starts_at: '2016-01-05 08:00:00', ends_at: '2016-01-05 10:00:00')
      get :index, params: { from: '2016-01-01 00:00:00', to: '2016-01-31 23:59:59' }, format: :json

      expect(response.code).to eql('200')
      expect(response.body).to be_json_eql([{ project_id: project.id, project_name: project.name, project_duration: 2.hours,
                                              user_name: user.to_s, user_id: user.id, duration: 2.hours }].to_json)
    end

    it 'returns work times grouped by projects for leader' do
      sign_in(user)
      worker = create(:user)
      project = create(:project)
      belonged_project = create(:project, leader_id: user.id)
      create(:work_time, user: worker, project: project, starts_at: '2016-01-05 08:00:00', ends_at: '2016-01-05 10:00:00')
      create(:work_time, user: worker, project: belonged_project, starts_at: '2016-01-05 10:00:00', ends_at: '2016-01-05 12:00:00')
      get :index, params: { from: '2016-01-01 00:00:00', to: '2016-01-31 23:59:59' }, format: :json

      expect(response.code).to eql('200')
      expect(response.body).to be_json_eql([{ project_id: belonged_project.id, project_name: belonged_project.name, project_duration: 2.hours,
                                              user_name: worker.to_s, user_id: worker.id, duration: 2.hours }].to_json)
    end
  end

  describe '#by_users' do
    it 'authenticates user' do
      get :by_users, format: :json
      expect(response.code).to eql('401')
    end

    it 'forbids regular user' do
      sign_in(user)
      get :by_users, format: :json
      expect(response.code).to eql('403')
    end

    it 'returns work times grouped by projects' do
      sign_in(manager)
      user = create(:user)
      project = create(:project)
      create(:work_time, user: user, project: project, starts_at: '2016-01-05 08:00:00', ends_at: '2016-01-05 10:00:00')
      get :by_users, params: { from: '2016-01-01 00:00:00', to: '2016-01-31 23:59:59' }, format: :json

      expect(response.code).to eql('200')
      expect(response.body).to be_json_eql([{ project_id: project.id, project_name: project.name, time_worked: 2.hours,
                                              user_name: user.to_s, user_id: user.id, user_work_time: 2.hours }].to_json)
    end
  end
end
