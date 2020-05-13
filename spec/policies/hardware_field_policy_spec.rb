# frozen_string_literal: true

require 'rails_helper'

describe HardwareFieldPolicy do
  permissions :update? do
    it 'grants access for admin' do
      expect(described_class).to permit(build_stubbed(:user, :admin), HardwareField.new(hardware: Hardware.new))
    end

    it 'grants access for hardware manager' do
      expect(described_class).to permit(build_stubbed(:user, :hardware_manager), HardwareField.new(hardware: Hardware.new))
    end

    it 'grants access for regular user' do
      expect(described_class).to permit(build_stubbed(:user), HardwareField.new(hardware: Hardware.new))
    end

    it 'denies access for regular user is record is locked' do
      expect(described_class).not_to permit(build_stubbed(:user), HardwareField.new(hardware: Hardware.new(locked: true)))
    end
  end

  permissions :create? do
    it 'grants access for admin' do
      expect(described_class).to permit(build_stubbed(:user, :admin), HardwareField.new(hardware: Hardware.new))
    end

    it 'grants access for hardware manager' do
      expect(described_class).to permit(build_stubbed(:user, :hardware_manager), HardwareField.new(hardware: Hardware.new))
    end

    it 'grants access for regular user' do
      expect(described_class).to permit(build_stubbed(:user), HardwareField.new(hardware: Hardware.new))
    end

    it 'denies access for regular user is record is locked' do
      expect(described_class).not_to permit(build_stubbed(:user), HardwareField.new(hardware: Hardware.new(locked: true)))
    end
  end

  permissions :destroy? do
    it 'grants access for admin' do
      expect(described_class).to permit(build_stubbed(:user, :admin), HardwareField.new(hardware: Hardware.new))
    end

    it 'grants access for hardware manager' do
      expect(described_class).to permit(build_stubbed(:user, :hardware_manager), HardwareField.new(hardware: Hardware.new))
    end

    it 'grants access for regular user' do
      expect(described_class).to permit(build_stubbed(:user), HardwareField.new(hardware: Hardware.new))
    end

    it 'denies access for regular user is record is locked' do
      expect(described_class).not_to permit(build_stubbed(:user), HardwareField.new(hardware: Hardware.new(locked: true)))
    end
  end
end
