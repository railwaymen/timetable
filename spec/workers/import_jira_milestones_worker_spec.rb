# frozen_string_literal: true

require 'rails_helper'

describe ImportJiraMilestonesWorker do
  describe '#perform' do
    it 'calls IncreaseWorkTime' do
      project = create(:project)
      user = create(:user)

      import_milestones = instance_double(ImportMilestones)

      expect(import_milestones).to receive(:call)
      expect(ImportMilestones).to receive(:new).with(project, user).and_return(import_milestones)
      described_class.new.perform(project.id, user.id)
    end
  end
end
