# frozen_string_literal: true

require 'rails_helper'
require 'csv'

RSpec.describe ReportsController do
  let(:user) { create(:user) }
  let(:manager) { create(:user, :manager) }

  describe '#project' do
    it 'authenticates user' do
      get :project, format: :csv
      expect(response.code).to eql('401')
    end

    it 'forbids regular user' do
      sign_in(user)
      get :project, format: :csv
      expect(response.code).to eql('403')
    end

    it 'returns vacations report in csv' do
      sign_in(manager)
      user = create(:user, contract_name: 'A/BC/123')
      vacation = create(
        :project,
        name: 'Vacation',
        vacation: true,
        work_times_allows_task: true
      )
      work_time1 = create(:work_time, task: 'http://example.com/task/24', user: user, project: vacation, body: 'Mallorca', starts_at: '2016-01-05 08:00:00', ends_at: '2016-01-05 16:00:00')
      work_time2 = create(:work_time, task: 'http://example.com/task/24', user: user, project: vacation, starts_at: '2016-01-06 08:00:00', ends_at: '2016-01-06 16:00:00')

      get :project, params: { id: vacation.id, from: '2016-01-01 00:00:00', to: '2016-01-31 23:59:59' }, format: :csv

      expect(response.code).to eql('200')

      require 'csv'
      csv = CSV.parse(response.body)
      expect(csv[0]).to eql(
        ['Contract ID', 'Developer', 'Date From', 'Date To', 'Description', 'Duration(Days)']
      )
      user_name = "#{user.last_name} #{user.first_name}"
      expect(csv[1]).to eql(
        [
          user.contract_name,
          user_name,
          work_time1.starts_at.strftime('%Y-%m-%d'),
          work_time2.ends_at.strftime('%Y-%m-%d'),
          work_time1.body,
          '2'
        ]
      )
    end

    it 'returns project report in csv' do
      sign_in(manager)
      user = create(:user)
      project = create(:project, work_times_allows_task: true)
      work_time1 = create(:work_time, task: 'http://example.com/task/24', user: user, project: project, starts_at: '2016-01-05 08:00:00', ends_at: '2016-01-05 10:00:00')
      work_time2 = create(:work_time, task: 'http://example.com/task/24', user: user, project: project, starts_at: '2016-01-05 12:00:00', ends_at: '2016-01-05 13:00:00')
      work_time3 = create(:work_time, user: user, project: project, starts_at: '2016-01-05 10:00:00', ends_at: '2016-01-05 12:00:00')
      get :project, params: { id: project.id, from: '2016-01-01 00:00:00', to: '2016-01-31 23:59:59' }, format: :csv

      expect(response.code).to eql('200')
      csv = CSV.parse(response.body)
      expect(csv[0]).to eql(['Developer', 'Date', 'Task URL', 'Description', 'Duration'])
      expect(csv[1]).to eql(["#{user.first_name} #{user.last_name}", '2016-01-05', 'http://example.com/task/24', work_time1.body, '01:00'])
      expect(csv[2]).to eql(["#{user.first_name} #{user.last_name}", '2016-01-05', 'http://example.com/task/24', work_time2.body, '02:00'])
      expect(csv[3]).to eql(["#{user.first_name} #{user.last_name}", nil, nil, nil, '03:00'])
      expect(csv[4]).to eql(["#{user.first_name} #{user.last_name}", '2016-01-05', nil, work_time3.body, '02:00'])
      expect(csv[5]).to eql(['Developer Total', nil, nil, nil, '05:00'])
    end

    it 'returns project report in csv for user' do
      sign_in(manager)
      user = create(:user)
      project = create(:project, work_times_allows_task: true, name: 'Test project')
      work_time1 = create(:work_time, task: 'http://example.com/task/24', user: user, project: project, starts_at: '2016-01-05 08:00:00', ends_at: '2016-01-05 10:00:00')
      work_time2 = create(:work_time, task: 'http://example.com/task/24', user: user, project: project, starts_at: '2016-01-05 12:00:00', ends_at: '2016-01-05 13:00:00')
      work_time3 = create(:work_time, user: user, project: project, starts_at: '2016-01-05 10:00:00', ends_at: '2016-01-05 12:00:00')
      get :project, params: { user_id: user.id, id: project.id, from: '2016-01-01 00:00:00', to: '2016-01-31 23:59:59' }, format: :csv

      expect(response.code).to eql('200')
      csv = CSV.parse(response.body)
      expect(csv[0]).to eql(['Project', 'Date', 'Task URL', 'Description', 'Duration'])
      expect(csv[1]).to eql(['Test project', '2016-01-05', 'http://example.com/task/24', work_time1.body, '01:00'])
      expect(csv[2]).to eql(['Test project', '2016-01-05', 'http://example.com/task/24', work_time2.body, '02:00'])
      expect(csv[3]).to eql([nil, nil, nil, nil, '03:00'])
      expect(csv[4]).to eql(['Test project', '2016-01-05', nil, work_time3.body, '02:00'])
      expect(csv[5]).to eql(['Developer Total', nil, nil, nil, '05:00'])
    end
  end

  describe '#remote_work' do
    it 'autheticates user' do
      get :remote_work, format: :csv

      expect(response.code).to eql('401')
    end

    it 'forbids regular user' do
      sign_in(user)

      get :remote_work, format: :csv

      expect(response.code).to eql('403')
    end

    it 'returns remote work report in csv' do
      work_time = create(:work_time)

      sign_in(manager)
      params = {
        user_id: work_time.user.id,
        from: work_time.starts_at.to_date
      }
      get :remote_work, params: params, format: :csv
      csv = CSV.parse(response.body)

      expect(response.code).to eql('200')
      expect(csv[0]).to eql(%w[Day Remote])
      expect(csv[1]).to eql([work_time.starts_at.strftime('%Y-%m-%d'), 'Y'])
    end
  end
end
