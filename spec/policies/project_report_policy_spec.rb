# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ProjectReportPolicy, type: :policy do
  let(:user) { User.new }

  subject { described_class }
  permissions :create?, :update?, :show?, :edit?, :roles?, :generate?, :refresh?, :file?, :synchronize? do
    it 'permits access if admin' do
      expect(subject).to permit(User.new(admin: true), ProjectReport.new)
    end

    it 'permits access if manager' do
      expect(subject).to permit(User.new(manager: true), ProjectReport.new)
    end

    it 'denies access if normal user' do
      expect(subject).not_to permit(User.new, ProjectReport.new)
    end
  end
end
