# frozen_string_literal: true

require 'rails_helper'

describe MilestoneEstimatePolicy do
  permissions :index? do
    it 'grants access for admin' do
      expect(described_class).to permit(build_stubbed(:user, :admin), MilestoneEstimate.new)
    end

    it 'grants access for manager' do
      expect(described_class).to permit(build_stubbed(:user, :manager), MilestoneEstimate.new)
    end

    it 'denies access for regular user' do
      expect(described_class).not_to permit(build_stubbed(:user), MilestoneEstimate.new)
    end
  end
end
