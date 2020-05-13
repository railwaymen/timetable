# frozen_string_literal: true

require 'rails_helper'

describe HardwarePolicy do
  permissions :update? do
    it 'grants access for admin' do
      expect(described_class).to permit(build_stubbed(:user, :admin), Hardware.new)
    end

    it 'grants access for hardware manager' do
      expect(described_class).to permit(build_stubbed(:user, :hardware_manager), Hardware.new)
    end

    it 'grants access for regular user' do
      expect(described_class).to permit(build_stubbed(:user), Hardware.new)
    end

    it 'denies access for regular user is record is locked' do
      expect(described_class).not_to permit(build_stubbed(:user), Hardware.new(locked: true))
    end
  end
end
