# frozen_string_literal: true

require 'rails_helper'

RSpec.describe RemoteWorkPolicy, type: :policy do
  subject { described_class }

  permissions '.scope' do
    let(:user) { create(:user) }
    let(:admin) { create(:admin) }
    let(:manager) { create(:manager) }

    context 'admin user' do
      it "checks admin's scope" do
        create(:remote_work)

        expect(described_class::Scope.new(admin, RemoteWork.all).resolve).to match_array RemoteWork.all
      end
    end

    context 'regular user' do
      it "checks user's scope" do
        create(:remote_work, user: admin)
        user_remote_work = create(:remote_work, user: user)

        expect(described_class::Scope.new(user, RemoteWork.all).resolve).to match_array [user_remote_work]
      end
    end
  end
end
