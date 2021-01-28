# frozen_string_literal: true

module Agreements
  class PartiesToTheAgreementGeneratorService
    def initialize(pdf, params)
      @pdf = pdf
      @params = params
    end

    def print_parties_to_the_agreement
      @pdf.text I18n.t('apps.hardware.agreements.agreement_between', date: Time.current.to_date.strftime('%d.%m.%Y')), inline_format: true
      lender = Lender.find(@params[:lender_id])
      company = lender.company
      print_company(company)
      print_lender(lender)
      print_borrower
    end

    private

    def print_company(company)
      @pdf.text company.name, style: :bold
      @pdf.text company.address
      @pdf.text [company.zip_code, company.city].join(' ')
      @pdf.text "#{I18n.t('apps.hardware.agreements.nip')}: #{company.nip}"
      @pdf.text ['KRS:', company.krs].join(' ')
    end

    def print_lender(lender)
      @pdf.text I18n.t('apps.hardware.agreements.represented_by')
      @pdf.text lender.to_s, style: :bold
      @pdf.text I18n.t('apps.hardware.agreements.referred_to_as', data: I18n.t('apps.hardware.agreements.lender').upcase), style: :bold
    end

    def print_borrower
      @pdf.text I18n.t('apps.hardware.agreements.and')
      @pdf.text I18n.t('apps.hardware.agreements.name_and_surname'), style: :bold
      @pdf.text I18n.t('apps.hardware.agreements.address'), style: :bold
      @pdf.text 'PESEL: ..........................', style: :bold
      @pdf.text I18n.t('apps.hardware.agreements.id_document'), style: :bold
      @pdf.text I18n.t('apps.hardware.agreements.referred_to_as', data: I18n.t('apps.hardware.agreements.borrower').upcase), style: :bold
    end
  end
end
