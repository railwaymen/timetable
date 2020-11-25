# frozen_string_literal: true

module Agreements
  class PartiesToTheAgreementGeneratorService
    def initialize(pdf, params)
      @pdf = pdf
      @params = params
    end

    def print_parties_to_the_agreement
      @pdf.text I18n.t('apps.hardware.agreements.agreement_between', date: Time.current.to_date.strftime('%d.%m.%Y')), inline_format: true
      print_company
      print_lender
      print_borrower
    end

    private

    def print_company
      case @params[:company]
      when 'railwaymen'
        print_railwaymen_company
      when 'rvm'
        print_rwm_company
      when 'posbistro'
        print_posbistro_company
      else
        print_railwaymen_company
      end
    end

    def print_railwaymen_company
      @pdf.text 'Railwaymen Sp. z o. o.', style: :bold
      print_company_address
      @pdf.text "#{I18n.t('apps.hardware.agreements.nip')}: 6793065841"
      @pdf.text 'KRS: 0000386418'
    end

    def print_rwm_company
      @pdf.text 'RWM Sp. z o. o.', style: :bold
      print_company_address
      @pdf.text 'NIP: 6793065841'
      @pdf.text 'KRS: 0000386418'
    end

    def print_posbistro_company
      @pdf.text 'PostBistro Sp. z o. o.', style: :bold
      print_company_address
      @pdf.text 'NIP: 6793065841'
      @pdf.text 'KRS: 0000386418'
    end

    def print_company_address
      @pdf.text 'ul. Na Zjeździe 11'
      @pdf.text '30-527 Kraków'
    end

    def print_lender
      @pdf.text I18n.t('apps.hardware.agreements.represented_by')
      @pdf.text lender, style: :bold
      @pdf.text I18n.t('apps.hardware.agreements.referred_to_as', data: I18n.t('apps.hardware.agreements.lender').upcase), style: :bold
    end

    def lender
      case @params[:lender]
      when 'lukasz'
        'Łukasz Młynek'
      when 'marcin'
        'Marcin Czesak'
      when 'grzegorz'
        'Grzegorz Forysiński'
      else
        'Łukasz Młynek'
      end
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
