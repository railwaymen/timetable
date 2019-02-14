# frozen_string_literal: true

require 'rails_helper'

describe UpdateExternalAuthWorker do
  describe '#perform' do
    it 'calls ExternalAuth' do
      call_double = double('externalauth', call: nil)
      project = create(:project)
      task_id = 'TD-1'
      expect(UpdateExternalAuth).to receive(:new).with(project, task_id) { call_double }
      expect(call_double).to receive(:call)
      UpdateExternalAuthWorker.new.perform(project.id, task_id)
    end
  end
end
