# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Reports::XlsxHelper, type: :helper do
  describe 'calculate_should_work' do
    it 'correctly resolve days number between dates' do
      date = '23-03-2020'.to_time

      result = helper.calculate_days_should_work(date - 5.days, date)

      expect(result).to eq 3
    end
  end

  describe 'duration_to_full_days' do
    it 'correctly change hours into working days numbers' do
      hour_seconds = 60 * 60
      minute_seconds = 60
      working_day = 8 * 60 * 60
      working_week = 40 * 60 * 60
      working_month = 168 * 60 * 60

      expect(helper.duration_to_full_days(hour_seconds)).to eq(1.0 / 8)
      expect(helper.duration_to_full_days(minute_seconds)).to eq(1.0 / (8 * 60))
      expect(helper.duration_to_full_days(working_day)).to eq(1)
      expect(helper.duration_to_full_days(working_week)).to eq(5)
      expect(helper.duration_to_full_days(working_month)).to eq(21)
    end
  end

  describe 'duration_to_workable_days' do
    it 'correctly change hours into working days numbers' do
      hour_seconds = 60 * 60 * 3
      minute_seconds = 60 * 3
      working_day = 8 * 60 * 60 * 3
      working_week = 40 * 60 * 60 * 3
      working_month = 168 * 60 * 60 * 3

      expect(helper.duration_to_workable_days(hour_seconds)).to eq(1.0 / 8)
      expect(helper.duration_to_workable_days(minute_seconds)).to eq(1.0 / (8 * 60))
      expect(helper.duration_to_workable_days(working_day)).to eq(1)
      expect(helper.duration_to_workable_days(working_week)).to eq(5)
      expect(helper.duration_to_workable_days(working_month)).to eq(21)
    end
  end
end
