# frozen_string_literal: true

require 'rails_helper'
require 'csv'

RSpec.describe Reports::CsvRemoteWork do
  let(:user) { create(:user) }
  let(:csv_remote_work) { described_class.new(user_id: user.id, from: '2022-01-01', to: '2022-01-01') }

  describe '#generate' do
    it 'create report with remote work status' do
      create(
        :work_time,
        office_work: false,
        starts_at: '2022-01-01 09:00:00',
        ends_at: '2022-01-01 11:00:00',
        user_id: user.id
      )
      create(
        :work_time,
        office_work: false,
        starts_at: '2022-01-01 11:00:00',
        ends_at: '2022-01-01 12:00:00',
        user_id: user.id
      )

      csv = CSV.parse(csv_remote_work.generate)

      expect(csv[1]).to eql(%w[2022-01-01 Y])
    end

    it 'create report with office work status' do
      create(
        :work_time,
        office_work: true,
        starts_at: '2022-01-01 09:00:00',
        ends_at: '2022-01-01 11:00:00',
        user_id: user.id
      )
      create(
        :work_time,
        office_work: true,
        starts_at: '2022-01-01 11:00:00',
        ends_at: '2022-01-01 12:00:00',
        user_id: user.id
      )

      csv = CSV.parse(csv_remote_work.generate)

      expect(csv[1]).to eql(%w[2022-01-01 N])
    end

    it 'create report with mix work status' do
      create(
        :work_time,
        office_work: true,
        starts_at: '2022-01-01 09:00:00',
        ends_at: '2022-01-01 11:00:00',
        user_id: user.id
      )
      create(
        :work_time,
        office_work: false,
        starts_at: '2022-01-01 11:00:00',
        ends_at: '2022-01-01 12:00:00',
        user_id: user.id
      )

      csv = CSV.parse(csv_remote_work.generate)

      expect(csv[1]).to eql(%w[2022-01-01 Y/N])
    end

    it 'create report with unknown work status' do
      create(
        :work_time,
        office_work: nil,
        starts_at: '2022-01-01 09:00:00',
        ends_at: '2022-01-01 11:00:00',
        user_id: user.id
      )
      create(
        :work_time,
        office_work: nil,
        starts_at: '2022-01-01 11:00:00',
        ends_at: '2022-01-01 12:00:00',
        user_id: user.id
      )

      csv = CSV.parse(csv_remote_work.generate)

      expect(csv[1]).to eql(%w[2022-01-01 NA])
    end
  end
end
