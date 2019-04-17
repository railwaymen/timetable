# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::ProjectReportsController, type: :controller do
  render_views

  let(:admin) { create(:admin) }
  let(:project) { create(:project) }

  before do
    sign_in admin
  end

  describe 'POST #create' do
    context 'all users have a role' do
      it 'creates project report' do
        time = Time.zone.now
        user = create(:user, first_name: 'Jan', last_name: 'Nowak')
        worker = create(:user, first_name: 'Tomasz', last_name: 'Kowalski')
        FactoryGirl.create :work_time, user: worker, project: project, starts_at: time - 30.minutes, ends_at: time - 25.minutes
        FactoryGirl.create :work_time, user: user, project: project, starts_at: time - 30.minutes, ends_at: time - 25.minutes
        FactoryGirl.create :work_time, user: worker, project: project, starts_at: time - 25.minutes, ends_at: time - 20.minutes

        expect do
          post(:create, params: {
                 format: 'json',
                 project_id: project,
                 range_start: (time - 2.days).beginning_of_day,
                 range_end: (time + 2.days).beginning_of_day,
                 project_report_roles: [worker, user].map { |u| { id: u.id, first_name: u.first_name, last_name: u.last_name, role: 'developer' } }
               })
        end.to change(ProjectReport, :count).by(1)
        expect(response).to be_ok
      end
    end

    context 'not all users have a role' do
      it 'does not create project report' do
        time = Time.zone.now
        user = create(:user, first_name: 'Jan', last_name: 'Nowak')
        worker = create(:user, first_name: 'Tomasz', last_name: 'Kowalski')
        FactoryGirl.create :work_time, user: worker, project: project, starts_at: time - 30.minutes, ends_at: time - 25.minutes
        FactoryGirl.create :work_time, user: user, project: project, starts_at: time - 30.minutes, ends_at: time - 25.minutes
        FactoryGirl.create :work_time, user: worker, project: project, starts_at: time - 25.minutes, ends_at: time - 20.minutes

        expect do
          post(:create, params: {
                 format: 'json',
                 project_id: project,
                 range_start: (time - 2.days).beginning_of_day,
                 range_end: (time + 2.days).beginning_of_day,
                 project_report_roles: [worker].map { |u| { id: u.id, first_name: u.first_name, last_name: u.last_name, role: 'developer' } }
               })
        end.to raise_error(ProjectReportCreator::NotAllUsersHaveRole)
      end
    end
  end

  describe 'PATCH #update' do
    it 'updates project report' do
      body = { development: [task: 'task', owner: 'Owner', duration: 300] }
      project_report = create(:project_report, initial_body: body, last_body: body, duration_sum: 300, project: project)
      patch :update, params: {
        format: 'json',
        project_id: project.id,
        id: project_report.id,
        project_report: { last_body: { development: [task: 'task1', owner: 'Owner', duration: 300] } }
      }
      expect(response).to be_ok
    end
  end

  describe 'GET #roles' do
    context 'no previous roles' do
      it 'returns users without role suggestion' do
        time = Time.zone.now
        user = create(:user, first_name: 'Jan', last_name: 'Nowak')
        worker = create(:user, first_name: 'Tomasz', last_name: 'Kowalski')
        FactoryGirl.create :work_time, user: worker, project: project, starts_at: time - 30.minutes, ends_at: time - 25.minutes
        FactoryGirl.create :work_time, user: user, project: project, starts_at: time - 30.minutes, ends_at: time - 25.minutes
        FactoryGirl.create :work_time, user: worker, project: project, starts_at: time - 25.minutes, ends_at: time - 20.minutes
        get :roles, params: { format: 'json', project_id: project, range_start: (time - 2.days).beginning_of_day, range_end: (time + 2.days).beginning_of_day }
        expect(response).to be_ok
        expect(JSON.parse(response.body)).to match_array([
                                                           {
                                                             'id' => user.id,
                                                             'first_name' => user.first_name,
                                                             'last_name' => user.last_name,
                                                             'role' => nil
                                                           },
                                                           {
                                                             'id' => worker.id,
                                                             'first_name' => worker.first_name,
                                                             'last_name' => worker.last_name,
                                                             'role' => nil
                                                           }
                                                         ])
      end
    end

    context 'previous roles' do
      it 'return users with role_suggestions' do
        time = Time.zone.now
        user = create(:user, first_name: 'Jan', last_name: 'Nowak')
        worker = create(:user, first_name: 'Tomasz', last_name: 'Kowalski')
        FactoryGirl.create :work_time, user: worker, project: project, starts_at: time - 30.minutes, ends_at: time - 25.minutes
        FactoryGirl.create :work_time, user: user, project: project, starts_at: time - 30.minutes, ends_at: time - 25.minutes
        FactoryGirl.create :work_time, user: worker, project: project, starts_at: time - 25.minutes, ends_at: time - 20.minutes
        report = project.project_reports.create!(state: :done, initial_body: { qa: [] }, last_body: { qa: [] }, range_start: (time - 40.days), range_end: (time - 20.days), duration_sum: 0)
        report.project_report_roles.create!(user: user, role: 'developer')

        get :roles, params: { format: 'json', project_id: project, range_start: (time - 2.days).beginning_of_day, range_end: (time + 2.days).beginning_of_day }
        expect(response).to be_ok
        expect(JSON.parse(response.body)).to match_array([
                                                           {
                                                             'id' => user.id,
                                                             'first_name' => user.first_name,
                                                             'last_name' => user.last_name,
                                                             'role' => 'developer'
                                                           },
                                                           {
                                                             'id' => worker.id,
                                                             'first_name' => worker.first_name,
                                                             'last_name' => worker.last_name,
                                                             'role' => nil
                                                           }
                                                         ])
      end
    end
  end

  describe 'GET #show' do
    let(:project_report) { create(:project_report) }
    it 'renders project report' do
      get :edit, params: { project_id: project_report.project.id, id: project_report.id }

      expect(response).to be_ok
    end
  end

  describe 'GET #edit' do
    let(:project_report) { create(:project_report) }

    it 'renders project report' do
      get :show, params: { project_id: project_report.project.id, id: project_report.id }

      expect(response).to be_ok
    end
  end
end
