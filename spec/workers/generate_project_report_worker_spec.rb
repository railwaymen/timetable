# frozen_string_literal: true

require 'rails_helper'
require 'fileutils'

describe GenerateProjectReportWorker do
  describe '#perform' do
    let(:project_report) { create(:project_report) }
    let(:content) { 'Lorem ipsum' }

    it 'creates correct file' do
      generatour_double = double
      allow(ProjectReportGenerator).to receive(:new).and_return(generatour_double)
      allow(generatour_double).to receive(:call) do |file_path|
        IO.write(file_path, content)
      end
      allow(Rails.root).to receive(:join) do |*arguments|
        File.join(__dir__, *arguments)
      end
      file_path = File.join(__dir__, 'system', 'uploads', 'reports', project_report.project_id.to_s, "#{project_report.id}.pdf")

      described_class.new.perform(project_report.id)

      expect(IO.read(file_path)).to eq content

      FileUtils.rm_r File.join(__dir__, 'system')
    end
  end
end
