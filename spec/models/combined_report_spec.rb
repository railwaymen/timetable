# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CombinedReport, type: :model do
  context 'validations' do
    it { should validate_presence_of :name }
  end

  it '#generated?' do
    report = build_stubbed(:combined_report, file_path: nil)
    expect(report.generated?).to be false

    report.file_path = 'path/to/some/file'
    expect(report.generated?).to be true
  end
end
