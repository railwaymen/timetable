require 'rails_helper'

RSpec.describe User, type: :model do
  it { should have_many(:work_times).dependent(:destroy) }
  it { should have_many(:accounting_periods).dependent(:destroy) }
  it { should validate_presence_of :first_name }
  it { should validate_presence_of :last_name }

  describe User, '.active' do
    it 'includes active users' do
      active = create :user, active: true
      expect(User.active).to include(active)
    end

    it 'excludes not active users' do
      not_active = create :user, active: false
      expect(User.active).to_not include(not_active)
    end
  end

  it '#to_s returns joined first_name and last_name' do
    user = build :user, first_name: 'John', last_name: 'Smith'
    expect(user.to_s).to eq 'Smith John'
  end

  it '#destroy changes active to false' do
    user = create :user
    user.destroy
    expect(user.active).to be_falsey
  end
end
