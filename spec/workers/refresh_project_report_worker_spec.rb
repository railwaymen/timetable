# frozen_string_literal: true

require 'rails_helper'

describe RefreshProjectReportWorker do
  describe '#perform' do
    it 'creates correct file' do
      refresher_double = double
      allow(ProjectReportRefresher).to receive(:new).and_return(refresher_double)
      allow(refresher_double).to receive(:call)

      RefreshProjectReportWorker.new.perform(1, 2)

      expect(ProjectReportRefresher).to have_received(:new).with(project_report_id: 1, user_id: 2)
      expect(refresher_double).to have_received(:call)
    end
  end
end
