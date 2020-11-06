# frozen_string_literal: true

require 'rails_helper'

RSpec.describe VacationsYearlyReportGenerator do
  def response(users)
    result = "Contract ID,Developer,#{I18n.t('common.planned')},#{I18n.t('common.requested')},#{I18n.t('common.compassionate')},"\
             "#{I18n.t('common.paternity')},#{I18n.t('common.parental')},#{I18n.t('common.upbringing')},#{I18n.t('common.unpaid')},"\
             "#{I18n.t('common.rehabilitation')},#{I18n.t('common.illness')},#{I18n.t('common.care')},#{I18n.t('common.overtime')},#{I18n.t('common.sum')}\n"
    users.each do |u|
      result += get_user_used_vacation_days(u)
    end
    result
  end

  def get_user_used_vacation_days(user)
    used_days = user.used_vacation_days
    sum = 0
    used_days.each { |ud| sum += ud[1] }
    "#{user.contract_name},#{user},#{used_days[:planned]},#{used_days[:requested]},#{used_days[:compassionate]},"\
    "#{used_days[:paternity]},#{used_days[:parental]},#{used_days[:upbringing]},#{used_days[:unpaid]},"\
    "#{used_days[:rehabilitation]},#{used_days[:illness]},#{used_days[:care]},#{used_days[:overtime]},#{sum}\n"
  end

  describe '#generate' do
    it 'generates csv' do
      user1 = create(:user)
      user2 = create(:user)
      create(:vacation, user: user1, vacation_type: :requested, status: :accepted)
      create(:vacation, user: user2, vacation_type: :planned, status: :accepted)
      expect(described_class.new.generate).to eql(response([user1, user2]))
    end
  end
end
