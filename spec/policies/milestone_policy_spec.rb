# frozen_string_literal: true

require 'rails_helper'

describe MilestonePolicy do
  permissions :index? do
    it 'grants access for admin' do
      expect(described_class).to permit(build_stubbed(:user, :admin), Milestone.new)
    end

    it 'grants access for manager' do
      expect(described_class).to permit(build_stubbed(:user, :manager), Milestone.new)
    end

    it 'denies access for regular user' do
      expect(described_class).not_to permit(build_stubbed(:user), Milestone.new)
    end
  end

  permissions :show? do
    it 'grants access for admin' do
      expect(described_class).to permit(build_stubbed(:user, :admin), Milestone.new)
    end

    it 'grants access for manager' do
      expect(described_class).to permit(build_stubbed(:user, :manager), Milestone.new)
    end

    it 'denies access for regular user' do
      expect(described_class).not_to permit(build_stubbed(:user), Milestone.new)
    end
  end

  permissions :create? do
    it 'grants access for admin' do
      expect(described_class).to permit(build_stubbed(:user, :admin), Milestone.new)
    end

    it 'grants access for manager' do
      expect(described_class).to permit(build_stubbed(:user, :manager), Milestone.new)
    end

    it 'denies access for regular user' do
      expect(described_class).not_to permit(build_stubbed(:user), Milestone.new)
    end
  end

  permissions :update? do
    it 'grants access for admin' do
      expect(described_class).to permit(build_stubbed(:user, :admin), Milestone.new)
    end

    it 'grants access for manager' do
      expect(described_class).to permit(build_stubbed(:user, :manager), Milestone.new)
    end

    it 'denies access for regular user' do
      expect(described_class).not_to permit(build_stubbed(:user), Milestone.new)
    end
  end

  permissions :import? do
    it 'grants access for admin' do
      expect(described_class).to permit(build_stubbed(:user, :admin), Milestone.new)
    end

    it 'grants access for manager' do
      expect(described_class).to permit(build_stubbed(:user, :manager), Milestone.new)
    end

    it 'denies access for regular user' do
      expect(described_class).not_to permit(build_stubbed(:user), Milestone.new)
    end
  end

  permissions :import_status? do
    it 'grants access for admin' do
      expect(described_class).to permit(build_stubbed(:user, :admin), Milestone.new)
    end

    it 'grants access for manager' do
      expect(described_class).to permit(build_stubbed(:user, :manager), Milestone.new)
    end

    it 'denies access for regular user' do
      expect(described_class).not_to permit(build_stubbed(:user), Milestone.new)
    end
  end

  permissions :work_times? do
    it 'grants access for admin' do
      expect(described_class).to permit(build_stubbed(:user, :admin), Milestone.new)
    end

    it 'grants access for manager' do
      expect(described_class).to permit(build_stubbed(:user, :manager), Milestone.new)
    end

    it 'denies access for regular user' do
      expect(described_class).not_to permit(build_stubbed(:user), Milestone.new)
    end
  end
end
