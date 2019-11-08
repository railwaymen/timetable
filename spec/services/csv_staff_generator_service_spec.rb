# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CsvStaffGeneratorService do
  def response(vacations)
    result = "Contract ID,Developer,Date From,Date To,Status,Duration (days),Description,Vacation Type,Vacation Code\n"
    vacations.each do |v|
      result += "#{v.user.contract_name},#{v.user.last_name} #{v.user.first_name},#{v.start_date.strftime('%Y-%m-%d')},"\
                "#{v.end_date.strftime('%Y-%m-%d')},#{I18n.t("apps.staff.#{v.status}")},#{v.start_date.business_days_until(v.end_date + 1.day)},"\
                "#{v.description},#{I18n.t("common.#{v.vacation_type}")},"\
                "#{I18n.t("common.vacation_code.#{v.vacation_sub_type.nil? ? v.vacation_type : v.vacation_sub_type}")}\n"
    end
    result
  end

  describe '#generate' do
    it 'generates csv' do
      user = create(:user)
      first_vacation = create(:vacation, user: user, description: 'Other', vacation_type: :others)
      second_vacation = create(:vacation, user: user, description: 'Other', vacation_type: :others, vacation_sub_type: :parental, status: :accepted)
      expect(described_class.new({}).generate).to eql(response([first_vacation, second_vacation]))
    end

    it 'filters by user' do
      user1 = create(:user)
      user2 = create(:user)
      user1_vacation = create(:vacation, user: user1)
      create(:vacation, user: user2)
      expect(described_class.new(user_id: user1.id).generate).to eql(response([user1_vacation]))
    end

    context 'filters by date' do
      before(:each) do
        @present_vacation = create(:vacation, start_date: Time.current.to_date, end_date: Time.current.to_date + 7.days)
        @past_vacation = create(:vacation, start_date: Time.current.to_date - 30.days, end_date: Time.current.to_date - 20.days)
        @future_vacation = create(:vacation, start_date: Time.current.to_date + 10.days, end_date: Time.current.to_date + 20.days)
      end

      it 'when given only start_date' do
        expect(described_class.new(start_date: Time.current.to_date - 19.days).generate).to eql(response([@present_vacation, @future_vacation]))
      end

      it 'when given only end_date' do
        expect(described_class.new(end_date: Time.current.to_date + 9.days).generate).to eql(response([@past_vacation, @present_vacation]))
      end

      it 'when given start_date and end_date' do
        expect(described_class.new(start_date: Time.current.to_date - 19.days,
                                   end_date: Time.current.to_date + 9.days).generate).to eql(response([@present_vacation]))
      end
    end
  end

  describe '#filename' do
    context 'returns correct filename' do
      it 'when given start_date' do
        expect(described_class.new(start_date: Time.current.to_date).filename).to eql("#{Time.current.to_date.strftime('%Y/%m/%d')}_vacations_report.csv")
      end

      it 'when given end_date' do
        expect(described_class.new(end_date: Time.current.to_date).filename).to eql("#{Time.current.to_date.strftime('%Y/%m/%d')}_vacations_report.csv")
      end

      it 'when given start_date and end_date' do
        expect(described_class.new(start_date: Time.current.to_date,
                                   end_date: Time.current.to_date + 1.day).filename).to eql("#{Time.current.to_date.strftime('%Y/%m/%d')}_#{(Time.current.to_date + 1.day).strftime('%Y/%m/%d')}_vacations_report.csv")
      end

      it 'when given start_date, end_date and user_id' do
        user = create(:user)
        create(:vacation, user: user)
        expect(described_class.new(start_date: Time.current.to_date,
                                   end_date: Time.current.to_date + 1.day,
                                   user_id: user.id).filename).to eql("#{user.to_s.downcase.tr(' ', '_')}_#{Time.current.to_date.strftime('%Y/%m/%d')}_#{(Time.current.to_date + 1.day).strftime('%Y/%m/%d')}_vacations_report.csv")
      end
    end
  end
end
