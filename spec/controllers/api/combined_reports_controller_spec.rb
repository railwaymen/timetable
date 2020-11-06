# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::CombinedReportsController do
  let(:project) { create(:project) }
  let(:project_report) { create(:project_report, state: :done, project: project) }
  let(:user) { create(:user) }
  let(:admin) { create(:user, :admin) }

  def combined_report_response(combined_report)
    combined_report.attributes
                   .slice('id', 'project_id', 'name', 'starts_at', 'ends_at', 'duration_sum', 'cost', 'currency')
                   .merge(generated: combined_report.generated?)
  end

  def combined_report_show_response(combined_report)
    project_reports = combined_report.project_reports.map do |pr|
      extra_params = {
        combined_reports_count: pr.combined_reports.count,
        duration: pr.duration_without_ignored,
        cost: pr.cost_without_ignored.to_f
      }

      pr.attributes.slice('id', 'project_id', 'state', 'starts_at', 'ends_at', 'currency', 'name').merge(extra_params)
    end

    combined_report_response(combined_report).merge(project_reports: project_reports)
  end

  describe '#index' do
    it 'authenticates user' do
      get :index, params: { project_id: project.id }, format: :json
      expect(response.code).to eql('401')
    end

    it "returns user's combined reports" do
      sign_in(admin)

      combined_report = create(:combined_report, project: project)
      get :index, params: { project_id: project.id }, format: :json
      expect(response.code).to eql('200')
      expect(response.body).to be_json_eql([combined_report_response(combined_report)].to_json)
    end

    it 'verifies scope' do
      sign_in(user)

      create(:combined_report, project: project)
      get :index, params: { project_id: project.id }, format: :json
      expect(response.code).to eql('200')
      expect(response.body).to be_json_eql([].to_json)
    end
  end

  describe '#create' do
    it 'authenticates user' do
      post :create, params: { project_id: project.id }, format: :json
      expect(response.code).to eql('401')
    end

    it 'creates combined report' do
      sign_in(admin)

      params = { name: 'Report name', report_ids: [project_report.id] }

      expect do
        post :create, params: { project_id: project.id, combined_report: params }, format: :json
      end.to change(CombinedReport, :count).by(1)

      expect(response.code).to eql('200')
      combined_report = CombinedReport.last

      expect(response.body).to be_json_eql(combined_report_response(combined_report).to_json)
    end

    it 'does not create combined report when params are invalid' do
      sign_in(admin)

      params = { report_ids: [project_report.id] }

      expect do
        post :create, params: { project_id: project.id, combined_report: params }, format: :json
      end.to_not change(CombinedReport, :count)

      expect(response.code).to eql('422')
      expect(response.body).to include_json({ error: :blank }.to_json).at_path('errors/name')
    end
  end

  describe '#show' do
    it 'authenticates user' do
      get :show, params: { id: 1 }, format: :json
      expect(response.code).to eql('401')
    end

    it 'return cobined report' do
      sign_in(admin)

      combined_report = create(:combined_report)
      create(:combined_reports_project_report, project_report: project_report, combined_report: combined_report)

      get :show, params: { id: combined_report.id }, format: :json

      expect(response.code).to eql('200')
      expect(response.body).to be_json_eql(combined_report_show_response(combined_report).to_json)
    end
  end

  describe '#destroy' do
    it 'authenticates user' do
      delete :destroy, params: { id: 1 }, format: :json
      expect(response.code).to eql('401')
    end

    it 'destroys combined report' do
      sign_in(admin)

      combined_report = create(:combined_report)
      delete :destroy, params: { id: combined_report.id }, format: :json

      expect(response.code).to eql('204')
      expect(combined_report.reload.discarded_at).to_not be_nil
    end
  end

  describe 'GET #synchronize' do
    it 'checks if combined report has synchronized project reports' do
      sign_in(admin)

      combined_report = create(:combined_report)
      create(:combined_reports_project_report, project_report: project_report, combined_report: combined_report)

      get :synchronize, params: { id: combined_report.id }

      synchronize_response = { synchronized: true }
      expect(response).to be_ok
      expect(response.body).to be_json_eql(synchronize_response.to_json)
    end
  end

  describe 'GET #file' do
    it 'sends file' do
      sign_in(admin)

      combined_report = create(:combined_report, file_path: file_fixture('sample.pdf').to_path)
      get :file, params: { id: combined_report.id }

      expect(response).to be_ok
      expect(response.body).to eq file_fixture('sample.pdf').binread
    end
  end
end
