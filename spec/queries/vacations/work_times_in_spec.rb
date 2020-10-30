# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Vacations::WorkTimesIn do
  describe '#perform' do
    it 'retruns valid data' do
      work_time = create(:work_time, starts_at: Time.zone.parse('2020/10/29 06:00:00'), ends_at: Time.zone.parse('2020/10/29 10:00:00'))
      start_date = Time.zone.parse('30/10/2020')
      end_date = Time.zone.parse('30/10/2020')

      expect(Vacations::WorkTimesIn.new(start_date, end_date, work_time.user_id).perform.empty?).to be(true)
    end

    it 'returns valid data' do
      work_time = create(:work_time, starts_at: Time.zone.parse('2020/10/30 07:00:00'), ends_at: Time.zone.parse('2020/10/30 10:00:00'))
      start_date = Time.zone.parse('30/10/2020')
      end_date = Time.zone.parse('30/10/2020')

      expect(Vacations::WorkTimesIn.new(start_date, end_date, work_time.user_id).perform.empty?).to be(false)
    end
  end
end
