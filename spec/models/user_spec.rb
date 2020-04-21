# frozen_string_literal: true

require 'rails_helper'

RSpec.describe User, type: :model do
  it { should have_many(:work_times).dependent(:destroy) }
  it { should have_many(:accounting_periods).dependent(:destroy) }
  it { should have_many(:vacations).dependent(:destroy) }
  it { should have_many(:vacation_interactions).dependent(:destroy) }
  it { should have_many(:vacation_periods).dependent(:destroy) }
  it { should validate_presence_of :first_name }
  it { should validate_presence_of :last_name }

  it '#to_s returns joined first_name and last_name' do
    user = build :user, first_name: 'John', last_name: 'Smith'
    expect(user.to_s).to eq 'Smith John'
  end

  it '#name returns joined first_name and last_name' do
    user = build :user, first_name: 'John', last_name: 'Smith'
    expect(user.name).to eq 'John Smith'
  end

  it '#anonymized_name returns joined first_name and first letter of last_name' do
    user = build :user, first_name: 'John', last_name: 'Smith'
    expect(user.anonymized_name).to eq 'John S'
  end

  describe 'phone validation' do
    it { is_expected.to allow_value('123456789').for(:phone) }
    it { is_expected.to allow_value('+1 (123) 456 789').for(:phone) }
    it { is_expected.to allow_value('123-456-789').for(:phone) }

    it { is_expected.to_not allow_value('asd asd asd').for(:phone) }
    it { is_expected.to_not allow_value('*123 456 789').for(:phone) }
  end
end
