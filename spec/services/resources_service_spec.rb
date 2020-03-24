# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ResourcesService do
  describe '#create_resource' do
    it 'creates resource & assign existing vacations' do
      vacation = create(:project, :vacation)
      user = create(:user)
      create(:vacation, user: user)

      project_resource = described_class.new.call(user_id: user.id)
      assignment = ProjectResourceAssignment.first!
      expect(project_resource.user_id).to eql(user.id)
      expect(assignment.project_id).to eql(vacation.id)
    end
  end
end
