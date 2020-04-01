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
                                              user_name: user.accounting_name, user_id: user.id, duration: 2.hours }].to_json)
    end

    it 'returns work times grouped by projects for admin' do
      sign_in(admin)
      user = create(:user)
      project = create(:project)
      create(:work_time, user: user, project: project, starts_at: '2016-01-05 08:00:00', ends_at: '2016-01-05 10:00:00')
      get :index, params: { from: '2016-01-01 00:00:00', to: '2016-01-31 23:59:59' }, format: :json

      expect(response.code).to eql('200')
      expect(response.body).to be_json_eql([{ project_id: project.id, project_name: project.name, project_duration: 2.hours,
                                              user_name: user.accounting_name, user_id: user.id, duration: 2.hours }].to_json)
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

    describe 'regular user' do
      it 'allow to see own data' do
        sign_in(user)
        project = FactoryBot.create :project
        project2 = FactoryBot.create :project

        FactoryBot.create :work_time, user: user, project: project, starts_at: Time.current - 50.minutes, ends_at: Time.current - 40.minutes
        FactoryBot.create :work_time, user: user, project: project, starts_at: Time.current - 30.minutes, ends_at: Time.current - 20.minutes
        FactoryBot.create :work_time, user: user, project: project2, starts_at: Time.current - 20.minutes, ends_at: Time.current - 10.minutes
        FactoryBot.create :work_time, user: user, project: project2, starts_at: Time.current - 10.minutes, ends_at: Time.current - 5.minutes

        other_user = FactoryBot.create :user

        FactoryBot.create :work_time, user: other_user, project: project, starts_at: Time.current - 50.minutes, ends_at: Time.current - 40.minutes
        FactoryBot.create :work_time, user: other_user, project: project, starts_at: Time.current - 30.minutes, ends_at: Time.current - 20.minutes
        FactoryBot.create :work_time, user: other_user, project: project2, starts_at: Time.current - 20.minutes, ends_at: Time.current - 10.minutes
        FactoryBot.create :work_time, user: other_user, project: project2, starts_at: Time.current - 10.minutes, ends_at: Time.current - 5.minutes

        get :by_users, params: { from: Time.current - 30.days, to: Time.current + 1.day }, format: :json

        reports = assigns(:report)

        expected_reports = [
          {
            user_name: "#{user.last_name} #{user.first_name}",
            project_id: project.id,
            user_id: user.id,
            project_name: project.name,
            time_worked: 1200,
            user_work_time: 2100
          }, {
            user_name: "#{user.last_name} #{user.first_name}",
            project_id: project2.id,
            user_id: user.id,
            project_name: project2.name,
            time_worked: 900,
            user_work_time: 2100
          }
        ]

        expect(reports.count).to eq 2
        expect(response.body).to eq expected_reports.to_json
        expect(response.code).to eql('200')
      end

      it 'reject in case of other data preview' do
        sign_in(user)
        project = FactoryBot.create :project
        project2 = FactoryBot.create :project

        FactoryBot.create :work_time, user: user, project: project, starts_at: Time.current - 50.minutes, ends_at: Time.current - 40.minutes
        FactoryBot.create :work_time, user: user, project: project, starts_at: Time.current - 30.minutes, ends_at: Time.current - 20.minutes
        FactoryBot.create :work_time, user: user, project: project2, starts_at: Time.current - 20.minutes, ends_at: Time.current - 10.minutes
        FactoryBot.create :work_time, user: user, project: project2, starts_at: Time.current - 10.minutes, ends_at: Time.current - 5.minutes

        other_user = FactoryBot.create :user

        FactoryBot.create :work_time, user: other_user, project: project, starts_at: Time.current - 50.minutes, ends_at: Time.current - 40.minutes
        FactoryBot.create :work_time, user: other_user, project: project, starts_at: Time.current - 30.minutes, ends_at: Time.current - 20.minutes
        FactoryBot.create :work_time, user: other_user, project: project2, starts_at: Time.current - 20.minutes, ends_at: Time.current - 10.minutes
        FactoryBot.create :work_time, user: other_user, project: project2, starts_at: Time.current - 10.minutes, ends_at: Time.current - 5.minutes

        get :by_users, params: { from: Time.current - 30.days, to: Time.current + 1.day, list: :all }, format: :json

        reports = assigns(:report)

        expected_reports = [
          {
            user_name: "#{user.last_name} #{user.first_name}",
            project_id: project.id,
            user_id: user.id,
            project_name: project.name,
            time_worked: 1200,
            user_work_time: 2100
          }, {
            user_name: "#{user.last_name} #{user.first_name}",
            project_id: project2.id,
            user_id: user.id,
            project_name: project2.name,
            time_worked: 900,
            user_work_time: 2100
          }
        ]

        expect(reports.count).to eq 2
        expect(response.body).to eq expected_reports.to_json
        expect(response.code).to eql('200')
      end
    end

    describe 'admin' do
      it 'allow to see own report data' do
        sign_in(admin)
        project = FactoryBot.create :project
        project2 = FactoryBot.create :project

        FactoryBot.create :work_time, user: admin, project: project, starts_at: Time.current - 50.minutes, ends_at: Time.current - 40.minutes
        FactoryBot.create :work_time, user: admin, project: project, starts_at: Time.current - 30.minutes, ends_at: Time.current - 20.minutes
        FactoryBot.create :work_time, user: admin, project: project2, starts_at: Time.current - 20.minutes, ends_at: Time.current - 10.minutes
        FactoryBot.create :work_time, user: admin, project: project2, starts_at: Time.current - 10.minutes, ends_at: Time.current - 5.minutes

        other_user = FactoryBot.create :user

        FactoryBot.create :work_time, user: other_user, project: project, starts_at: Time.current - 50.minutes, ends_at: Time.current - 40.minutes
        FactoryBot.create :work_time, user: other_user, project: project, starts_at: Time.current - 30.minutes, ends_at: Time.current - 20.minutes
        FactoryBot.create :work_time, user: other_user, project: project2, starts_at: Time.current - 20.minutes, ends_at: Time.current - 10.minutes
        FactoryBot.create :work_time, user: other_user, project: project2, starts_at: Time.current - 10.minutes, ends_at: Time.current - 5.minutes

        get :by_users, params: { from: Time.current - 30.days, to: Time.current + 1.day, list: :self }, format: :json

        reports = assigns(:report)

        expected_reports = [
          {
            user_name: "#{admin.last_name} #{admin.first_name}",
            project_id: project.id,
            user_id: admin.id,
            project_name: project.name,
            time_worked: 1200,
            user_work_time: 2100
          }, {
            user_name: "#{admin.last_name} #{admin.first_name}",
            project_id: project2.id,
            user_id: admin.id,
            project_name: project2.name,
            time_worked: 900,
            user_work_time: 2100
          }
        ]

        expect(reports.count).to eq 2
        expect(response.body).to eq expected_reports.to_json
        expect(response.code).to eql('200')
      end

      it 'allow to see overall report data' do
        sign_in(admin)
        project = FactoryBot.create :project
        project2 = FactoryBot.create :project

        FactoryBot.create :work_time, user: admin, project: project, starts_at: Time.current - 50.minutes, ends_at: Time.current - 40.minutes
        FactoryBot.create :work_time, user: admin, project: project, starts_at: Time.current - 30.minutes, ends_at: Time.current - 20.minutes
        FactoryBot.create :work_time, user: admin, project: project2, starts_at: Time.current - 20.minutes, ends_at: Time.current - 10.minutes
        FactoryBot.create :work_time, user: admin, project: project2, starts_at: Time.current - 10.minutes, ends_at: Time.current - 5.minutes

        other_user = FactoryBot.create :user

        FactoryBot.create :work_time, user: other_user, project: project, starts_at: Time.current - 50.minutes, ends_at: Time.current - 40.minutes
        FactoryBot.create :work_time, user: other_user, project: project, starts_at: Time.current - 30.minutes, ends_at: Time.current - 20.minutes
        FactoryBot.create :work_time, user: other_user, project: project2, starts_at: Time.current - 20.minutes, ends_at: Time.current - 10.minutes
        FactoryBot.create :work_time, user: other_user, project: project2, starts_at: Time.current - 10.minutes, ends_at: Time.current - 5.minutes

        get :by_users, params: { from: Time.current - 30.days, to: Time.current + 1.day, list: :all }, format: :json

        reports = assigns(:report)

        expected_reports = [
          {
            user_name: "#{admin.last_name} #{admin.first_name}",
            project_id: project.id,
            user_id: admin.id,
            project_name: project.name,
            time_worked: 1200,
            user_work_time: 2100
          }, {
            user_name: "#{admin.last_name} #{admin.first_name}",
            project_id: project2.id,
            user_id: admin.id,
            project_name: project2.name,
            time_worked: 900,
            user_work_time: 2100
          }, {
            user_name: "#{other_user.last_name} #{other_user.first_name}",
            project_id: project.id,
            user_id: other_user.id,
            project_name: project.name,
            time_worked: 1200,
            user_work_time: 2100
          }, {
            user_name: "#{other_user.last_name} #{other_user.first_name}",
            project_id: project2.id,
            user_id: other_user.id,
            project_name: project2.name,
            time_worked: 900,
            user_work_time: 2100
          }
        ]

        expect(reports.count).to eq 4
        expect(response.body).to eq expected_reports.to_json
        expect(response.code).to eql('200')
      end
    end

    describe 'leader' do
      it 'allow to see own report data' do
        sign_in(user)
        project = FactoryBot.create :project, leader_id: user.id
        project2 = FactoryBot.create :project

        FactoryBot.create :work_time, user: user, project: project, starts_at: Time.current - 50.minutes, ends_at: Time.current - 40.minutes
        FactoryBot.create :work_time, user: user, project: project, starts_at: Time.current - 30.minutes, ends_at: Time.current - 20.minutes
        FactoryBot.create :work_time, user: user, project: project2, starts_at: Time.current - 20.minutes, ends_at: Time.current - 10.minutes
        FactoryBot.create :work_time, user: user, project: project2, starts_at: Time.current - 10.minutes, ends_at: Time.current - 5.minutes

        other_user = FactoryBot.create :user

        FactoryBot.create :work_time, user: other_user, project: project, starts_at: Time.current - 50.minutes, ends_at: Time.current - 40.minutes
        FactoryBot.create :work_time, user: other_user, project: project, starts_at: Time.current - 30.minutes, ends_at: Time.current - 20.minutes
        FactoryBot.create :work_time, user: other_user, project: project2, starts_at: Time.current - 20.minutes, ends_at: Time.current - 10.minutes
        FactoryBot.create :work_time, user: other_user, project: project2, starts_at: Time.current - 10.minutes, ends_at: Time.current - 5.minutes

        get :by_users, params: { from: Time.current - 30.days, to: Time.current + 1.day, list: :self }, format: :json

        reports = assigns(:report)

        expected_reports = [
          {
            user_name: "#{user.last_name} #{user.first_name}",
            project_id: project.id,
            user_id: user.id,
            project_name: project.name,
            time_worked: 1200,
            user_work_time: 2100
          }, {
            user_name: "#{user.last_name} #{user.first_name}",
            project_id: project2.id,
            user_id: user.id,
            project_name: project2.name,
            time_worked: 900,
            user_work_time: 2100
          }
        ]

        expect(reports.count).to eq 2
        expect(response.body).to eq expected_reports.to_json
        expect(response.code).to eql('200')
      end

      it 'allow to see overall report data for own project' do
        sign_in(user)
        project = FactoryBot.create :project, leader_id: user.id
        project2 = FactoryBot.create :project

        FactoryBot.create :work_time, user: user, project: project, starts_at: Time.current - 50.minutes, ends_at: Time.current - 40.minutes
        FactoryBot.create :work_time, user: user, project: project, starts_at: Time.current - 30.minutes, ends_at: Time.current - 20.minutes
        FactoryBot.create :work_time, user: user, project: project2, starts_at: Time.current - 20.minutes, ends_at: Time.current - 10.minutes
        FactoryBot.create :work_time, user: user, project: project2, starts_at: Time.current - 10.minutes, ends_at: Time.current - 5.minutes

        other_user = FactoryBot.create :user

        FactoryBot.create :work_time, user: other_user, project: project, starts_at: Time.current - 50.minutes, ends_at: Time.current - 40.minutes
        FactoryBot.create :work_time, user: other_user, project: project, starts_at: Time.current - 30.minutes, ends_at: Time.current - 20.minutes
        FactoryBot.create :work_time, user: other_user, project: project2, starts_at: Time.current - 20.minutes, ends_at: Time.current - 10.minutes
        FactoryBot.create :work_time, user: other_user, project: project2, starts_at: Time.current - 10.minutes, ends_at: Time.current - 5.minutes

        get :by_users, params: { from: Time.current - 30.days, to: Time.current + 1.day, list: :leader }, format: :json

        reports = assigns(:report)

        expected_reports = [
          {
            user_name: "#{user.last_name} #{user.first_name}",
            project_id: project.id,
            user_id: user.id,
            project_name: project.name,
            time_worked: 1200,
            user_work_time: 1200
          }, {
            user_name: "#{other_user.last_name} #{other_user.first_name}",
            project_id: project.id,
            user_id: other_user.id,
            project_name: project.name,
            time_worked: 1200,
            user_work_time: 1200
          }
        ]

        expect(reports.count).to eq 2
        expect(response.body).to eq expected_reports.to_json
        expect(response.code).to eql('200')
      end
    end
  end
end
