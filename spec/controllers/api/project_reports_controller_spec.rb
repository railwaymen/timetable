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
        FactoryBot.create :work_time, user: worker, project: project, starts_at: time - 30.minutes, ends_at: time - 25.minutes
        FactoryBot.create :work_time, user: user, project: project, starts_at: time - 30.minutes, ends_at: time - 25.minutes
        FactoryBot.create :work_time, user: worker, project: project, starts_at: time - 25.minutes, ends_at: time - 20.minutes

        expect do
          post(:create, params: {
                 format: 'json',
                 project_id: project,
                 currency: 'd',
                 name: 'name',
                 starts_at: (time - 2.days).beginning_of_day,
                 ends_at: (time + 2.days).beginning_of_day,
                 project_report_roles: [worker, user].map { |u| { id: u.id, first_name: u.first_name, last_name: u.last_name, role: 'developer', hourly_wage: 30.5 } }
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
        FactoryBot.create :work_time, user: worker, project: project, starts_at: time - 30.minutes, ends_at: time - 25.minutes
        FactoryBot.create :work_time, user: user, project: project, starts_at: time - 30.minutes, ends_at: time - 25.minutes
        FactoryBot.create :work_time, user: worker, project: project, starts_at: time - 25.minutes, ends_at: time - 20.minutes

        expect do
          post(:create, params: {
                 format: 'json',
                 project_id: project,
                 currency: 'd',
                 starts_at: (time - 2.days).beginning_of_day,
                 ends_at: (time + 2.days).beginning_of_day,
                 project_report_roles: [worker].map { |u| { id: u.id, first_name: u.first_name, last_name: u.last_name, role: 'developer', hourly_wage: 30.5 } }
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

  describe 'DELETE #destroy' do
    it 'deletes project report' do
      project_report = create(:project_report, project: project)
      delete :destroy, params: {
        format: 'json',
        project_id: project.id,
        id: project_report.id
      }
      expect(response).to be_success
      expect(ProjectReport.find_by(id: project_report.id)).to be_nil
    end
  end

  describe 'GET #roles' do
    context 'no previous roles' do
      it 'returns users without role suggestion' do
        time = Time.zone.now
        user = create(:user, first_name: 'Jan', last_name: 'Nowak')
        worker = create(:user, first_name: 'Tomasz', last_name: 'Kowalski')
        FactoryBot.create :work_time, user: worker, project: project, starts_at: time - 30.minutes, ends_at: time - 25.minutes
        FactoryBot.create :work_time, user: user, project: project, starts_at: time - 30.minutes, ends_at: time - 25.minutes
        FactoryBot.create :work_time, user: worker, project: project, starts_at: time - 25.minutes, ends_at: time - 20.minutes
        get :roles, params: { format: 'json', project_id: project, starts_at: (time - 2.days).beginning_of_day, ends_at: (time + 2.days).beginning_of_day }
        expect(response).to be_ok
        parsed_body = JSON.parse(response.body)
        expect(parsed_body['user_roles']).to match_array([
                                                           {
                                                             'id' => user.id,
                                                             'first_name' => user.first_name,
                                                             'last_name' => user.last_name,
                                                             'role' => nil,
                                                             'hourly_wage' => 0.0.to_s,
                                                             'description' => ''
                                                           },
                                                           {
                                                             'id' => worker.id,
                                                             'first_name' => worker.first_name,
                                                             'last_name' => worker.last_name,
                                                             'role' => nil,
                                                             'hourly_wage' => 0.0.to_s,
                                                             'description' => ''
                                                           }
                                                         ])

        expect(parsed_body['currency']).to eq ''
      end
    end

    context 'previous roles' do
      it 'return users with role suggestions' do
        time = Time.zone.now
        user = create(:user, first_name: 'Jan', last_name: 'Nowak')
        worker = create(:user, first_name: 'Tomasz', last_name: 'Kowalski')
        FactoryBot.create :work_time, user: worker, project: project, starts_at: time - 30.minutes, ends_at: time - 25.minutes
        FactoryBot.create :work_time, user: user, project: project, starts_at: time - 30.minutes, ends_at: time - 25.minutes
        FactoryBot.create :work_time, user: worker, project: project, starts_at: time - 25.minutes, ends_at: time - 20.minutes
        report = project.project_reports.create!(state: :done, initial_body: { qa: [] }, last_body: { qa: [] }, starts_at: (time - 40.days), ends_at: (time - 20.days), duration_sum: 0, currency: 'd')
        report.project_report_roles.create!(user: user, role: 'developer', hourly_wage: 30, description: 'Frontend')

        get :roles, params: { format: 'json', project_id: project, starts_at: (time - 2.days).beginning_of_day, ends_at: (time + 2.days).beginning_of_day }
        expect(response).to be_ok
        parsed_body = JSON.parse(response.body)
        expect(parsed_body['user_roles']).to match_array([
                                                           {
                                                             'id' => user.id,
                                                             'first_name' => user.first_name,
                                                             'last_name' => user.last_name,
                                                             'role' => 'developer',
                                                             'hourly_wage' => 30.0.to_s,
                                                             'description' => 'Frontend'
                                                           },
                                                           {
                                                             'id' => worker.id,
                                                             'first_name' => worker.first_name,
                                                             'last_name' => worker.last_name,
                                                             'role' => nil,
                                                             'hourly_wage' => 0.0.to_s,
                                                             'description' => ''
                                                           }
                                                         ])
        expect(parsed_body['currency']).to eq 'd'
      end
    end

    context 'user in old reports but not in recent report' do
      it 'return users with role suggestions' do
        time = Time.zone.now
        user = create(:user, first_name: 'Jan', last_name: 'Nowak')
        user_not_in_recent_report = create(:user, first_name: 'Tomasz', last_name: 'Kowalski')
        new_user = create(:user, first_name: 'Michał', last_name: 'Malinowski')
        FactoryBot.create :work_time, user: user_not_in_recent_report, project: project, starts_at: time - 30.minutes, ends_at: time - 25.minutes
        FactoryBot.create :work_time, user: user, project: project, starts_at: time - 30.minutes, ends_at: time - 25.minutes
        FactoryBot.create :work_time, user: new_user, project: project, starts_at: time - 25.minutes, ends_at: time - 20.minutes
        old_report = project.project_reports.create!(state: :done, initial_body: { qa: [] }, last_body: { qa: [] }, starts_at: (time - 40.days), ends_at: (time - 20.days), duration_sum: 0, currency: 'd')
        old_report.project_report_roles.create!(user: user_not_in_recent_report, role: 'developer', hourly_wage: 31, description: 'Frontend')

        report = project.project_reports.create!(state: :done, initial_body: { qa: [] }, last_body: { qa: [] }, starts_at: (time - 40.days), ends_at: (time - 20.days), duration_sum: 0, currency: 'd')
        report.project_report_roles.create!(user: user, role: 'developer', hourly_wage: 30, description: 'Backend')

        get :roles, params: { format: 'json', project_id: project, starts_at: (time - 2.days).beginning_of_day, ends_at: (time + 2.days).beginning_of_day }
        expect(response).to be_ok
        parsed_body = JSON.parse(response.body)
        expect(parsed_body['user_roles']).to match_array([
                                                           {
                                                             'id' => user.id,
                                                             'first_name' => user.first_name,
                                                             'last_name' => user.last_name,
                                                             'role' => 'developer',
                                                             'hourly_wage' => 30.0.to_s,
                                                             'description' => 'Backend'
                                                           },
                                                           {
                                                             'id' => user_not_in_recent_report.id,
                                                             'first_name' => user_not_in_recent_report.first_name,
                                                             'last_name' => user_not_in_recent_report.last_name,
                                                             'role' => 'developer',
                                                             'hourly_wage' => 31.0.to_s,
                                                             'description' => 'Frontend'
                                                           },
                                                           {
                                                             'id' => new_user.id,
                                                             'first_name' => new_user.first_name,
                                                             'last_name' => new_user.last_name,
                                                             'role' => nil,
                                                             'hourly_wage' => 0.0.to_s,
                                                             'description' => ''
                                                           }
                                                         ])
        expect(parsed_body['currency']).to eq 'd'
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

  describe 'PUT #generate' do
    it 'generates project report' do
      allow(GenerateProjectReportWorker).to receive(:perform_async)
      body = { development: [task: 'task', owner: 'Owner', duration: 300] }
      project_report = create(:project_report, initial_body: body, last_body: body, duration_sum: 300, project: project)
      patch :generate, params: {
        format: 'json',
        project_id: project.id,
        id: project_report.id
      }
      expect(response).to be_ok
      expect(project_report.reload).to be_done
      expect(GenerateProjectReportWorker).to have_received(:perform_async).with(project_report.id)
    end
  end

  describe 'GET #edit' do
    let(:project_report) { create(:project_report) }

    it 'renders project report' do
      get :show, params: { project_id: project_report.project.id, id: project_report.id }

      expect(response).to be_ok
    end
  end

  describe 'GET #index' do
    let(:project) { create(:project) }

    it 'renders index' do
      get :index, params: { project_id: project.id }

      expect(response).to be_ok
    end

    context 'params starts_at and ends_at' do
      it 'filters out projects' do
        time = Time.current
        create(:project_report, project: project, starts_at: time - 7.days, ends_at: time - 6.days)
        matching_report = create(:project_report, project: project, starts_at: time, ends_at: time + 1.day)

        get :index, params: { project_id: project.id, starts_at: time - 1.day, ends_at: time + 8.days }
        expect(response).to be_ok
        body = JSON.parse(response.body)
        expect(body.size).to eq 1
        expect(body.first['id']).to eq matching_report.id
      end
    end
  end

  describe 'GET #file' do
    let(:project_report) { create(:project_report) }
    context 'no file' do
      it 'renders no content' do
        get :file, params: { project_id: project_report.project.id, id: project_report.id }

        expect(response).to be_no_content
      end
    end

    context 'file do' do
      it 'sends file' do
        project_report.update!(file_path: file_fixture('sample.pdf').to_path)
        get :file, params: { project_id: project_report.project.id, id: project_report.id }

        expect(response).to be_ok
        expect(response.body).to eq file_fixture('sample.pdf').binread
      end
    end
  end
end
