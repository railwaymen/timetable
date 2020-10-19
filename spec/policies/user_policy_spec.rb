# frozen_string_literal: true

require 'rails_helper'

describe UserPolicy do
  permissions :index? do
    it 'grants access for admin' do
      expect(described_class).to permit(build_stubbed(:user, :admin), User.new)
    end

    it 'grants access for hardware manager' do
      expect(described_class).to permit(build_stubbed(:user, :hardware_manager), User.new)
    end

    it 'grants access for manager user' do
      expect(described_class).to permit(build_stubbed(:user, :manager), User.new)
    end

    it 'denies access for regular user ' do
      expect(described_class).not_to permit(build_stubbed(:user), User.new)
    end
  end
end
