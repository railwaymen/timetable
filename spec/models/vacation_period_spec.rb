# frozen_string_literal: true

require 'rails_helper'

RSpec.describe VacationPeriod, type: :model do
  before(:each) { I18n.locale = :en }
  it { should belong_to(:user) }

  it { should validate_presence_of(:user_id) }
  it { should validate_presence_of(:starts_at) }
  it { should validate_presence_of(:ends_at) }
  it { should validate_presence_of(:vacation_days) }

  it 'validates uniqueness of user scoped to starts_at and ends_at' do
    vacation_period1 = create(:vacation_period)
    vacation_period2 = build(:vacation_period, user: vacation_period1.user)
    expect(vacation_period2.valid?).to be_falsey
    expect(vacation_period2.errors.messages[:user_id]).to eql([I18n.t('activerecord.errors.models.vacation_period.attributes.user_id.validates_uniqueness')])
  end
end
