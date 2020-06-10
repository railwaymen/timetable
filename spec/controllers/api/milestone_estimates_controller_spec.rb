# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::MilestoneEstimatesController do
  let(:user) { create(:user) }
  let(:admin) { create(:user, :admin) }

  def estimate_response(estimate)
    estimate.slice('id', 'created_at', 'note', 'dev_estimate', 'dev_estimate_diff', 'qa_estimate', 'qa_estimate_diff',
                   'ux_estimate', 'ux_estimate_diff', 'pm_estimate', 'pm_estimate_diff', 'other_estimate', 'other_estimate_diff',
                   'external_estimate', 'external_estimate_diff', 'total_estimate', 'total_estimate_diff')
  end

  describe '#index' do
    it 'authenticates user' do
      get :index, params: { project_id: 1, milestone_id: 1 }, format: :json
      expect(response.code).to eql('401')
    end

    it 'returns milestone estimates' do
      sign_in(admin)
      milestone = create(:milestone)
      estimate = create(:milestone_estimate, milestone: milestone)
      get :index, params: { project_id: milestone.project_id, milestone_id: milestone.id }, format: :json
      expect(response.code).to eql('200')
      expect(response.body).to be_json_eql([estimate_response(estimate)].to_json)
    end
  end
end
