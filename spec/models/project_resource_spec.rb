# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ProjectResource, type: :model do
  it { should belong_to :user }
  it { should belong_to :parent_resource }
  it { should have_many :child_resources }
  it { should have_many :assignments }

  it { should validate_presence_of :rid }
  it { should validate_presence_of :name }

  describe 'validate uniqueness of rid' do
    subject { create(:project_resource) }
    it { should validate_uniqueness_of :rid }
  end
end
