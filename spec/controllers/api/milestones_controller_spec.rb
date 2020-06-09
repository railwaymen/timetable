# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::MilestonesController do
  let(:user) { create(:user) }
  let(:admin) { create(:user, :admin) }

  def milestone_response(milestone)
    milestone.slice('id', 'external_id', 'name', 'starts_on', 'ends_on', 'project_id', 'dev_estimate', 'closed', 'visible_on_reports',
                    'qa_estimate', 'ux_estimate', 'pm_estimate', 'other_estimate', 'external_estimate', 'total_estimate')
             .merge(current: milestone == milestone.project.current_milestone, date_overlaps: milestone.overlaps_with_other?)
  end

  describe '#index' do
    it 'authenticates user' do
      get :index, params: { project_id: 1 }, format: :json
      expect(response.code).to eql('401')
    end

    it 'returns milestones with estimates' do
      sign_in(admin)
      milestone = create(:milestone, starts_on: 5.days.ago, ends_on: 5.days.from_now)
      work_time = create(:work_time, project: milestone.project)
      get :index, params: { project_id: milestone.project_id, with_estimates: true }, format: :json
      expect(response.code).to eql('200')
      expect(response.body).to be_json_eql([milestone_response(milestone).merge(work_times_duration: work_time.duration)].to_json)
    end

    it 'returns milestones visible for reports' do
      sign_in(admin)
      milestone = create(:milestone, visible_on_reports: true, starts_on: 5.days.ago, ends_on: 5.days.from_now)
      create(:milestone, project: milestone.project, starts_on: 10.days.ago, ends_on: 10.days.from_now)
      get :index, params: { project_id: milestone.project_id, only_visible: true }, format: :json
      expect(response.code).to eql('200')
      expect(response.body).to be_json_eql([milestone_response(milestone)].to_json)
    end
  end

  describe '#create' do
    it 'authenticates user' do
      get :show, params: { project_id: 1, id: 1 }, format: :json
      expect(response.code).to eql('401')
    end

    it 'returns milestone' do
      sign_in(admin)
      milestone = create(:milestone)

      get :show, params: { project_id: milestone.project_id, id: milestone.id }, as: :json
      expect(response.code).to eql('200')
      expect(response.body).to be_json_eql(milestone_response(milestone).to_json)
    end
  end

  describe '#create' do
    it 'authenticates user' do
      post :create, params: { project_id: 1 }, format: :json
      expect(response.code).to eql('401')
    end

    it 'creates milestone' do
      sign_in(admin)
      project = create(:project)
      starts_on = Time.zone.today
      ends_on = 1.month.from_now.to_date

      post :create, params: { project_id: project.id, name: 'Test', starts_on: starts_on, ends_on: ends_on }, as: :json
      milestone = Milestone.first
      expect(milestone.name).to eql('Test')
      expect(milestone.starts_on).to eql(starts_on)
      expect(milestone.ends_on).to eql(ends_on)
      expect(response.code).to eql('200')
      expect(response.body).to be_json_eql(milestone_response(milestone).to_json)
    end
  end

  describe '#update' do
    it 'authenticates user' do
      put :update, params: { id: 1, project_id: 1 }, format: :json
      expect(response.code).to eql('401')
    end

    it 'updates milestone & create estimate history' do
      sign_in(admin)
      milestone = create(:milestone, dev_estimate: 10)
      starts_on = Time.zone.today
      ends_on = 1.month.from_now.to_date

      estimate_fields = {
        dev_estimate: 25, qa_estimate: 2, ux_estimate: 0, pm_estimate: 0, other_estimate: 0
      }

      put :update, params: estimate_fields.merge(id: milestone.id, project_id: milestone.project_id, name: 'Test new', starts_on: starts_on, ends_on: ends_on), as: :json
      estimate = milestone.estimates.first!
      expect(milestone.reload.name).to eql('Test new')
      expect(milestone.starts_on).to eql(starts_on)
      expect(milestone.ends_on).to eql(ends_on)
      expect(milestone.dev_estimate).to eql(25)
      expect(milestone.qa_estimate).to eql(2)
      expect(estimate.dev_estimate).to eql(25)
      expect(estimate.dev_estimate_diff).to eql(15)
      expect(estimate.qa_estimate).to eql(2)
      expect(estimate.qa_estimate_diff).to eql(2)
      expect(estimate.total_estimate).to eql(27)
      expect(estimate.total_estimate_diff).to eql(17)
      expect(response.code).to eql('200')
      expect(response.body).to be_json_eql(milestone_response(milestone).to_json)
    end
  end

  describe '#work_times' do
    it 'authenticates user' do
      get :work_times, params: { project_id: 1 }, format: :json
      expect(response.code).to eql('401')
    end

    it 'returns report data' do
      sign_in(admin)
      milestone = create(:milestone, starts_on: 5.days.ago, ends_on: 5.days.from_now)
      work_time = create(:work_time, project: milestone.project)
      work_time_response = work_time.slice(:id, :starts_at, :ends_at, :duration, :tag, :date, :department)
                                    .merge({
                                             body: work_time.body,
                                             task: work_time.task,
                                             task_preview: work_time.task,
                                             user_name: work_time.user.name,
                                             external_id: work_time.external('task_id')
                                           })

      get :work_times, params: { project_id: milestone.project_id, milestone_id: milestone.id }, format: :json
      expect(response.code).to eql('200')
      expect(response.body).to be_json_eql([work_time_response].to_json)
    end
  end

  describe '#import' do
    it 'authenticates user' do
      post :import, params: { project_id: 1 }, format: :json
      expect(response.code).to eql('401')
    end

    it 'enqueues milestone import' do
      sign_in(admin)
      project = create(:project)
      expect(ImportJiraMilestonesWorker).to receive(:perform_async).with(project.id, admin.id)

      post :import, params: { project_id: project.id }, as: :json
      expect(response.code).to eql('204')
    end
  end

  describe '#import_status' do
    it 'authenticates user' do
      get :import_status, params: { project_id: 1 }, format: :json
      expect(response.code).to eql('401')
    end

    it 'returns job status' do
      sign_in(admin)
      project = create(:project)
      check_job_exists = instance_double(CheckJobExist)
      expect(check_job_exists).to receive(:call).and_return(false)
      expect(CheckJobExist).to receive(:new).with(ImportJiraMilestonesWorker).and_return(check_job_exists)

      get :import_status, params: { project_id: project.id }, as: :json
      expect(response.code).to eql('200')
      expect(response.body).to be_json_eql({ complete: true }.to_json)
    end
  end
end
