# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Project, type: :model do
  it { should have_many :work_times }
  it { should validate_presence_of :name }

  describe 'validate uniqueness' do
    subject { create :project }

    it { should validate_uniqueness_of :name }
  end
end
