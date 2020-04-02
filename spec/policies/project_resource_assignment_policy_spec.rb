# frozen_string_literal: true

require 'rails_helper'

describe ProjectResourceAssignmentPolicy do
  permissions :index? do
    it 'grants access for admin' do
      expect(described_class).to permit(build_stubbed(:user, :admin), self)
    end

    it 'grants access for manager' do
      expect(described_class).to permit(build_stubbed(:user, :manager), self)
    end

    it 'denies access for regular user' do
      expect(described_class).not_to permit(build_stubbed(:user), self)
    end
  end

  permissions :find_by_slot? do
    it 'grants access for admin' do
      expect(described_class).to permit(build_stubbed(:user, :admin), self)
    end

    it 'grants access for manager' do
      expect(described_class).to permit(build_stubbed(:user, :manager), self)
    end

    it 'denies access for regular user' do
      expect(described_class).not_to permit(build_stubbed(:user), self)
    end
  end

  permissions :create? do
    it 'grants access for admin' do
      expect(described_class).to permit(build_stubbed(:user, :admin), self)
    end

    it 'grants access for manager' do
      expect(described_class).to permit(build_stubbed(:user, :manager), self)
    end

    it 'denies access for regular user' do
      expect(described_class).not_to permit(build_stubbed(:user), self)
    end
  end

  permissions :update? do
    it 'grants access for admin' do
      expect(described_class).to permit(build_stubbed(:user, :admin), self)
    end

    it 'grants access for manager' do
      expect(described_class).to permit(build_stubbed(:user, :manager), self)
    end

    it 'denies access for regular user' do
      expect(described_class).not_to permit(build_stubbed(:user), self)
    end
  end

  permissions :destroy? do
    it 'grants access for admin' do
      expect(described_class).to permit(build_stubbed(:user, :admin), self)
    end

    it 'grants access for manager' do
      expect(described_class).to permit(build_stubbed(:user, :manager), self)
    end

    it 'denies access for regular user' do
      expect(described_class).not_to permit(build_stubbed(:user), self)
    end
  end
end
