# frozen_string_literal: true

require 'rails_helper'
require 'fileutils'

describe GenerateCombinedReportWorker do
  describe '#perform' do
    it 'creates correct file' do
      project = create(:project, name: 'Project abc')
      combined_report = create(:combined_report, project: project, name: 'Report xyz')
      content = 'Lorem ipsum'

      generatour_double = double
      allow(CombinedReportGenerator).to receive(:new).and_return(generatour_double)
      allow(generatour_double).to receive(:call) do |file_path|
        IO.write(file_path, content)
      end
      allow(Rails.root).to receive(:join) do |*arguments|
        File.join(__dir__, *arguments)
      end
      file_name = "Project_abc-Report_xyz-#{combined_report.id}.pdf"
      file_path = File.join(__dir__, 'system', 'uploads', 'combined_reports', combined_report.project_id.to_s, file_name)
      begin
        GenerateCombinedReportWorker.new.perform(combined_report.id)

        expect(IO.read(file_path)).to eq content
      ensure
        FileUtils.rm_r File.join(__dir__, 'system')
      end
    end
  end
end
