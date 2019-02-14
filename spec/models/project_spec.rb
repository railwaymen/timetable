# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Project, type: :model do
  it { should have_many :work_times }
  it { should have_one(:external_auth).dependent(:destroy) }
  it { should validate_presence_of :name }
end
