# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::MilestonesController do
  let(:user) { create(:user) }
  let(:admin) { create(:user, :admin) }

  def milestone_response(milestone)
    milestone.slice('id', 'external_id', 'name', 'starts_on', 'ends_on', 'position', 'project_id', 'dev_estimate',
                    'qa_estimate', 'ux_estimate', 'pm_estimate', 'other_estimate', 'external_estimate', 'total_estimate')
  end

  describe '#index' do
    it 'authenticates user' do
      get :index, params: { project_id: 1 }, format: :json
      expect(response.code).to eql('401')
    end

    it 'returns milestones' do
      sign_in(admin)
      milestone = create(:milestone)
      get :index, params: { project_id: milestone.project_id }, format: :json
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
