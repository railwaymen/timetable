require 'rails_helper'

RSpec.describe WorkTime, type: :model do
  it 'has paper trail' do
    is_expected.to be_versioned
  end

  it { should belong_to :project }
  it { should belong_to :user }
  it { should belong_to(:creator).class_name('User') }

  describe '#assign_duration before validation' do
    it 'assigns duration zero for project zero' do
      project = create :project, name: 'Zero', count_duration: false
      work_time = create :work_time, project_id: project.id
      expect(work_time.duration).to eq 0
    end

    it 'counts duration' do
      work_time = create :work_time, starts_at: Time.current,
                                     ends_at: 2.hours.from_now
      expect(work_time.duration).to eq 7200
    end
  end

  context 'validations' do
    before(:each) do
      @work_time = create :work_time
      allow(@work_time).to receive(:assign_duration)
    end

    it 'should validate presence of project_id' do
      @work_time.project_id = nil
      expect(@work_time).to_not be_valid
    end

    context 'duration' do
      it 'should be a number' do
        @work_time.duration = 'aaa'
        expect(@work_time).to_not be_valid
      end

      it 'should allow positive numbers' do
        @work_time.duration = 1
        expect(@work_time).to be_valid
      end

      it 'should not allow negative numbers' do
        @work_time.duration = -1
        expect(@work_time).to_not be_valid
      end
    end

    context 'body' do
      it 'should be required for regular projects' do
        work_time = create :work_time
        work_time.body = ''
        expect(work_time).to_not be_valid
      end

      it 'should not be required for lunch' do
        work_time = create :work_time,
                           project: (create :project, name: 'Lunch', lunch: true),
                           body: ''
        expect(work_time).to be_valid
      end

      it 'should not require body for vacation' do
        work_time = create :work_time,
                           project: (create :project, name: 'Vacation', autofill: true),
                           body: ''
        expect(work_time).to be_valid
      end
    end
  end
end
