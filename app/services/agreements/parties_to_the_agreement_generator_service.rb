# frozen_string_literal: true

module Agreements
  class PartiesToTheAgreementGeneratorService
    include PdfFields
    include PdfSettings

    def initialize(pdf, params, borrower_id)
      @pdf = pdf
      @params = params
      @borrower_id = borrower_id
    end

    def print_parties_to_the_agreement
      @pdf.text I18n.t('apps.hardware.agreements.agreement_between', date: Time.current.to_date.strftime('%d.%m.%Y')), inline_format: true
      company = Company.find(@params[:company_id])
      borrower = User.find(@borrower_id)
      print_company(company)
      print_lenders(company.lenders)
      print_borrower(borrower)
    end
  end
end
