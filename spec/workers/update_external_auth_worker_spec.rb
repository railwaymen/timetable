# frozen_string_literal: true

require 'rails_helper'

describe UpdateExternalAuthWorker do
  describe '#perform' do
    it 'calls ExternalAuth' do
      call_double = double('externalauth', call: nil)
      work_time = create(:work_time)
      project = work_time.project
      task_id = 'TD-1'
      expect(UpdateExternalAuth).to receive(:new).with(project, task_id, work_time) { call_double }
      expect(call_double).to receive(:call)
      UpdateExternalAuthWorker.new.perform(project.id, task_id, work_time.id)
    end
  end
end
