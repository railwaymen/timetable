# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CombinedReportPolicy, type: :policy do
  subject { described_class }

  let(:user) { create(:user) }
  let(:admin) { create(:user, :admin) }
  let(:manager) { create(:user, :manager) }

  permissions '.scope' do
    context 'admin user' do
      it "checks admin's scope" do
        create(:combined_report)
        expect(described_class::Scope.new(admin, CombinedReport.all).resolve).to match_array CombinedReport.all
      end
    end

    context 'manager user' do
      it "checks manager's scope" do
        create(:remote_work)
        expect(described_class::Scope.new(manager, CombinedReport.all).resolve).to match_array CombinedReport.all
      end
    end

    context 'regular user' do
      it "checks user's scope" do
        create(:remote_work, user: admin)
        expect(described_class::Scope.new(user, CombinedReport.all).resolve).to be_empty
      end
    end
  end

  permissions :create?, :show?, :destroy?, :synchronize?, :file? do
    it 'permits access if admin' do
      expect(subject).to permit(admin, ProjectReport.new)
    end

    it 'permits access if manager' do
      expect(subject).to permit(manager, ProjectReport.new)
    end

    it 'denies access if normal user' do
      expect(subject).not_to permit(user, ProjectReport.new)
    end
  end
end
