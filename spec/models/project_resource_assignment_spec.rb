# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ProjectResourceAssignment, type: :model do
  it { should belong_to :user }
  it { should belong_to :project_resource }
  it { should belong_to :project }
  it { should belong_to :vacation }

  it { should validate_presence_of :starts_at }
  it { should validate_presence_of :ends_at }
  it { should validate_presence_of :resource_rid }
  it { should validate_presence_of :type }
  it { should validate_presence_of :user_id }
  it { should validate_presence_of :project_resource_id }
end
