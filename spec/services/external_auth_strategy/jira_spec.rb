# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ExternalAuthStrategy::Jira do
  let(:jira_double) { double('jira') }
  let(:domain) { 'http://www.example.com' }

  before do
    allow(JIRA::Client).to receive(:new).and_return(jira_double)
  end

  describe '.from_data' do
    it 'initialzies correctly' do
      data = { 'domain' => domain, 'token' => 'token', 'secret' => 'secret' }
      expect(jira_double).to receive(:set_access_token).with(data['token'], data['secret'])
      described_class.from_data(data)
    end
  end

  describe '#init_access_token' do
    it 'delegates action correctly' do
      strategy = described_class.new('domain' => domain)
      token = 'Asdf'
      expect(jira_double).to receive(:init_access_token).with(oauth_verifier: token)
      strategy.init_access_token(token)
    end
  end

  describe '#data' do
    it 'returns essential auth data' do
      access_token = double('access_token', domain: domain, token: 'token', secret: 'secret')
      allow(jira_double).to receive(:access_token).and_return(access_token)
      strategy = described_class.new('domain' => domain)
      expect(strategy.data).to eq('domain' => domain, 'token' => 'token', 'secret' => 'secret')
    end
  end

  describe '#request_data' do
    it 'returns essential request auth data' do
      request_token_double = double('request_token', domain: domain, token: 'token', secret: 'secret')
      allow(jira_double).to receive(:request_token).and_return(request_token_double)
      strategy = described_class.new('domain' => domain)
      expect(strategy.request_data).to eq('token' => 'token', 'secret' => 'secret')
    end
  end

  describe '#authorization_url' do
    it 'returns essential request auth data' do
      authorize_url = "#{domain}/authorize"
      request_token_double = double('request_token', authorize_url: authorize_url)
      allow(jira_double).to receive(:request_token).and_return(request_token_double)
      strategy = described_class.new('domain' => domain)
      expect(strategy.authorization_url).to eq(authorize_url)
    end
  end

  describe '#prepare_request_data' do
    it 'calls set request token' do
      params = { 'token' => 'token', 'secret' => 'secret' }
      strategy = described_class.new('domain' => domain)
      expect(jira_double).to receive(:set_request_token).with('token', 'secret')
      strategy.prepare_request_data(params)
    end
  end

  describe '#integration_payload' do
    context 'valid task' do
      it 'returns payload' do
        url = "#{domain}/asd?a=3"
        jira_fields = { 'labels' => %w[bug critical], 'issuetype' => { 'name' => 'Bug' } }
        issue_double = double('issue', key: 'ASD', summary: 'Body', fields: jira_fields)
        issues_double = double('Issue')
        allow(issues_double).to receive(:find).with(issue_double.key) { issue_double }
        allow(jira_double).to receive(:Issue) { issues_double }
        strategy = described_class.new('domain' => domain)

        expect(strategy.integration_payload(url)).to eq(task_id: issue_double.key,
                                                        summary: issue_double.summary,
                                                        labels: jira_fields['labels'],
                                                        issue_type: jira_fields['issuetype']['name'])
      end
    end

    context 'invalid task' do
      it 'returns nil' do
        url = "#{domain}/asd?a=3"
        issues_double = double('Issue')
        response = Net::HTTPSuccess.new(1.0, '200', 'OK')

        expect(response).to receive(:body).and_return('{}')
        allow(issues_double).to receive(:find).with('ASD').and_raise(JIRA::HTTPError, response)
        allow(jira_double).to receive(:Issue) { issues_double }
        strategy = described_class.new('domain' => domain)
        expect(strategy.integration_payload(url)).to be_nil
      end
    end
  end

  describe 'versions' do
    it 'fetches project versions' do
      project_id = '1'

      version = { id: 10 }
      project_double = double('Project')
      project_class_double = double('Project')
      expect(jira_double).to receive(:Project) { project_class_double }
      expect(project_class_double).to receive(:find).with(project_id) { project_double }
      expect(project_double).to receive(:versions) { [version] }

      strategy = described_class.new('domain' => domain)
      expect(strategy.versions(project_id)).to eql([version])
    end
  end

  describe 'version_issues' do
    it 'fetches project versions' do
      project_id = '1'
      version_id = '10'

      issue = { id: 10 }
      issue_class_double = double('Issue')
      expect(jira_double).to receive(:Issue) { issue_class_double }
      expect(issue_class_double).to receive(:jql).with("project = '#{project_id}' AND fixVersion = #{version_id}") { [issue] }

      strategy = described_class.new('domain' => domain)
      expect(strategy.version_issues(project_id, version_id)).to eql([issue])
    end
  end

  describe 'update' do
    context 'work log exists' do
      it 'updates worklog' do
        path = '/example/rest'
        issue_double = double('issue', key: 'ASD', timetracking: { 'originalEstimateSeconds' => 60 })
        author_double = double('User', accountId: '123')
        worklog_double = double('worklog', patched_url: path, issue: issue_double, author: author_double)
        allow(issue_double).to receive(:worklogs).and_return([worklog_double])
        issues_double = double('Issue')
        myself_double = double('User', accountId: '123')
        user_double = double('User', myself: myself_double)
        allow(issues_double).to receive(:find).with(issue_double.key) { issue_double }
        allow(jira_double).to receive(:Issue) { issues_double }
        allow(jira_double).to receive(:User).and_return(user_double)

        params = { 'task_id' => issue_double.key, 'time_spent' => 60 }

        expect(worklog_double).to receive(:save!).with({ comment: described_class::COMMENT, timeSpentSeconds: 60 }, path)

        strategy = described_class.new('domain' => domain)
        strategy.update(params)
      end

      it 'destroys worklog when time_spent is 0' do
        path = '/example/rest'
        issue_double = double('issue', key: 'ASD')
        author_double = double('User', accountId: '123')
        worklog_double = double('worklog', patched_url: path, issue: issue_double, author: author_double)
        allow(issue_double).to receive(:worklogs).and_return([worklog_double])
        issues_double = double('Issue')
        myself_double = double('User', accountId: '123')
        user_double = double('User', myself: myself_double)
        allow(issues_double).to receive(:find).with(issue_double.key) { issue_double }
        allow(jira_double).to receive(:Issue) { issues_double }
        allow(jira_double).to receive(:User).and_return(user_double)

        params = { 'task_id' => issue_double.key, 'time_spent' => 0 }

        expect(jira_double).to receive(:delete).with(worklog_double.patched_url)

        strategy = described_class.new('domain' => domain)
        strategy.update(params)
      end
    end

    context 'work log does not exist' do
      context 'estimate' do
        it 'creates new worklog' do
          path = '/example/rest'
          issue_double = double('issue', key: 'ASD', timetracking: { 'originalEstimateSeconds' => 60 })
          build_double = double('build', patched_url: path, issue: issue_double)
          worklogs_double = double('worklogs', find: nil, build: build_double)
          allow(issue_double).to receive(:worklogs).and_return(worklogs_double)
          issues_double = double('Issue')
          myself_double = double('User', accountId: '123')
          user_double = double('User', myself: myself_double)
          allow(issues_double).to receive(:find).with(issue_double.key) { issue_double }
          allow(jira_double).to receive(:Issue) { issues_double }
          allow(jira_double).to receive(:User).and_return(user_double)

          params = { 'task_id' => issue_double.key, 'time_spent' => 60 }

          expect(build_double).to receive(:save!).with({ comment: described_class::COMMENT, timeSpentSeconds: 60 }, path)

          strategy = described_class.new('domain' => domain)
          strategy.update(params)
        end
      end

      context 'no estimate' do
        it 'creates new worklog' do
          path = '/example/rest'
          issue_double = double('issue', key: 'ASD', timetracking: {})
          build_double = double('build', patched_url: path, issue: issue_double)
          worklogs_double = double('worklogs', find: nil, build: build_double)
          allow(issue_double).to receive(:worklogs) { worklogs_double }
          issues_double = double('Issue')
          myself_double = double('User', accountId: '123')
          user_double = double('User', myself: myself_double)
          allow(issues_double).to receive(:find).with(issue_double.key) { issue_double }
          allow(jira_double).to receive(:Issue) { issues_double }
          allow(jira_double).to receive(:User).and_return(user_double)

          params = { 'task_id' => issue_double.key, 'time_spent' => 60 }

          expect(build_double).to receive(:save!).with({ comment: described_class::COMMENT, timeSpentSeconds: 60 }, "#{path}?adjustEstimate=leave")

          strategy = described_class.new('domain' => domain)
          strategy.update(params)
        end
      end
    end
  end
end
