# frozen_string_literal: true

module Agreements
  class PartiesToTheAgreementGeneratorService
    include PdfFields
    include PdfSettings

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
  end
end
