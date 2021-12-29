# frozen_string_literal: true

require 'csv'

class CsvPeople
  def initialize(filter: 'active')
    @filter = filter
  end

  def generate
    CSV.generate do |csv|
      csv << translated_headers

      records.each { |record| csv << record }
    end
  end

  def filename
    'people.csv'
  end

  private

  def records
    User.order(Arel.sql('contract_name::bytea ASC')).filter_by(@filter.to_sym).pluck(
      :last_name,
      :first_name,
      :email,
      :contract_name,
      :phone,
      :department
    )
  end

  def translated_headers
    [
      I18n.t('apps.users.last_name'),
      I18n.t('apps.users.first_name'),
      'Email',
      I18n.t('apps.users.contract_id'),
      I18n.t('apps.users.phone'),
      I18n.t('apps.users.department')
    ]
  end
end
