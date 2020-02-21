# frozen_string_literal: true

require 'csv'

class VacationsYearlyReportGenerator
  def initialize
    @users = User.order('contract_name::bytea ASC').filter_by('active')
  end

  def generate
    CSV.generate(headers: true) do |csv|
      headers = [
        'Contract ID', 'Developer', I18n.t('common.planned'), I18n.t('common.requested'), I18n.t('common.compassionate'),
        I18n.t('common.paternity'), I18n.t('common.parental'), I18n.t('common.upbringing'), I18n.t('common.unpaid'),
        I18n.t('common.rehabilitation'), I18n.t('common.illness'), I18n.t('common.care'), I18n.t('common.sum')
      ]

      csv << headers

      add_rows(csv)
    end
  end

  private

  def add_rows(csv)
    @users.each do |user|
      csv << prepare_row(user)
    end
  end

  def prepare_row(user)
    used_days = user.used_vacation_days
    row = [user.contract_name, user.to_s]
    sum = 0
    used_days.each do |ud|
      row.push(ud[1])
      sum += ud[1]
    end
    row.push(sum)
  end
end
