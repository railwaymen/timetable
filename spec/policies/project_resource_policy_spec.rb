# frozen_string_literal: true

require 'rails_helper'

describe ProjectResourcePolicy do
  permissions :index? do
    it 'grants access for admin' do
      expect(described_class).to permit(build_stubbed(:user, :admin), ProjectResource.new)
    end

    it 'grants access for manager' do
      expect(described_class).to permit(build_stubbed(:user, :manager), ProjectResource.new)
    end

    it 'denies access for regular user' do
      expect(described_class).not_to permit(build_stubbed(:user), ProjectResource.new)
    end
  end

  permissions :activity? do
    it 'grants access for admin' do
      expect(described_class).to permit(build_stubbed(:user, :admin), ProjectResource.new)
    end

    it 'grants access for manager' do
      expect(described_class).to permit(build_stubbed(:user, :manager), ProjectResource.new)
    end

    it 'denies access for regular user' do
      expect(described_class).not_to permit(build_stubbed(:user), ProjectResource.new)
    end
  end

  permissions :create? do
    it 'grants access for admin' do
      expect(described_class).to permit(build_stubbed(:user, :admin), ProjectResource.new)
    end

    it 'grants access for manager' do
      expect(described_class).to permit(build_stubbed(:user, :manager), ProjectResource.new)
    end

    it 'denies access for regular user' do
      expect(described_class).not_to permit(build_stubbed(:user), ProjectResource.new)
    end
  end

  permissions :destroy? do
    it 'grants access for admin' do
      expect(described_class).to permit(build_stubbed(:user, :admin), ProjectResource.new)
    end

    it 'grants access for manager' do
      expect(described_class).to permit(build_stubbed(:user, :manager), ProjectResource.new)
    end

    it 'denies access for regular user' do
      expect(described_class).not_to permit(build_stubbed(:user), ProjectResource.new)
    end
  end
end
