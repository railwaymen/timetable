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
end
