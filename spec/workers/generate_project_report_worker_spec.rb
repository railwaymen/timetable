# frozen_string_literal: true

require 'rails_helper'
require 'fileutils'

describe GenerateProjectReportWorker do
  describe '#perform' do
    let(:project_report) { create(:project_report) }
    let(:content) { 'Lorem ipsum' }

    it 'creates correct file' do
      generator_double = double
      allow(ProjectReportPdfGenerator).to receive(:new).and_return(generator_double)
      allow(generator_double).to receive(:call) do |file_path|
        IO.write(file_path, content)
      end
      allow(Rails.root).to receive(:join) do |*arguments|
        File.join(__dir__, *arguments)
      end
      file_name = [project_report.project.name, project_report.name, project_report.id.to_s]
                  .map { |str| str.parameterize(separator: '_', preserve_case: true) }
                  .join('-')
                  .concat('.pdf')
      file_path = File.join(__dir__, 'system', 'uploads', 'reports', project_report.project_id.to_s, file_name)
      begin
        described_class.new.perform(project_report.id)

        expect(IO.read(file_path)).to eq content
      ensure
        FileUtils.rm_r File.join(__dir__, 'system')
      end
    end
  end
end
