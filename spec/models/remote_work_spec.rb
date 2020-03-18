# frozen_string_literal: true

require 'rails_helper'

RSpec.describe RemoteWork, type: :model do
  it 'has paper trail' do
    is_expected.to be_versioned
  end

  it { should belong_to :user }
  it { should belong_to(:creator).class_name('User') }

  describe '#assign_duration before validation' do
    it 'counts duration' do
      work_time = create :remote_work, starts_at: Time.current, ends_at: 2.hours.from_now
      expect(work_time.duration).to eq 7200
    end
  end

  context 'validations' do
    let :remote_work do
      remote_work = build_stubbed(:remote_work)
      allow(remote_work).to receive(:assign_duration)
      remote_work
    end

    it 'should not throw exceptions for empty values' do
      expect(WorkTime.new).to_not be_valid
    end

    context 'duration' do
      it 'should be a number' do
        remote_work.duration = 'aaa'
        expect(remote_work).to_not be_valid
      end

      it 'should allow positive numbers' do
        remote_work.duration = 1
        expect(remote_work).to be_valid
      end

      it 'should not allow negative numbers' do
        remote_work.duration = -1
        expect(remote_work).to_not be_valid
      end
    end
  end
end
