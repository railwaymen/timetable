# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ProjectReportCsvGenerator do
  describe '#call' do
    it 'returns csv export' do
      last_body = {
        'developer' => [
          {
            cost: 100,
            description: 'Project setup',
            task: 'http://example.com/SET-1',
            duration: 3600,
            owner: 'John Smith',
            tag: 'dev'
          },
          {
            cost: 100,
            description: 'Project setup #2',
            task: 'http://example.com/SET-1, Client call',
            duration: 3600,
            owner: 'John Smith',
            tag: 'dev'
          }
        ],
        'ignored' => [
          {
            cost: 200,
            description: 'Project kickoff',
            duration: 7200,
            owner: 'John Smith',
            tag: 'internal meeting'
          }
        ]
      }
      project_report = create(:project_report, last_body: last_body, cost: 400)
      csv_data = described_class.new(project_report).call
      date_range = [project_report.starts_at, project_report.ends_at].map { |n| n.strftime('%Y/%m/%d') }.join('-')

      expected_data = [
        ['Report Name', 'Date Range', 'Category', 'Person', 'Tag', 'Task', 'Description', 'Duration', 'Cost'].join(','),
        [project_report.name, date_range, 'Development', 'John Smith', 'Dev', '"=HYPERLINK(""http://example.com/SET-1"", ""SET-1"")"', 'Project setup', '01:00', 'PLN 100.00'].join(','),
        [project_report.name, date_range, 'Development', 'John Smith', 'Dev', '"http://example.com/SET-1, Client call"', 'Project setup #2', '01:00', 'PLN 100.00'].join(',')
      ].join("\n") + "\n"

      expect(csv_data).to eql(expected_data)
    end
  end
end
