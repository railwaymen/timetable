# frozen_string_literal: true

module Agreements
  module PdfFields
    def return_paragraph_number_1
      I18n.t('apps.hardware.return_agreement.paragraph_number_1')
    end

    def rental_paragraph_number_1
      I18n.t('apps.hardware.rental_agreement.paragraph_number_1')
    end

    def print_header
      @pdf.text 'Kraków, ................', align: :right
      @pdf.text agreement_title, align: :center, style: :bold
      @pdf.move_down 20
    end

    def print_singatures
      @pdf.float do
        @pdf.bounding_box([0, @pdf.cursor], width: 115) do
          @pdf.text '.......................................', align: :center
          @pdf.text I18n.t('apps.hardware.borrower'), align: :center
        end
      end
      @pdf.bounding_box([@pdf.bounds.width - 200, @pdf.cursor], width: 200) do
        @pdf.text '.......................................', align: :center
        @pdf.text I18n.t('apps.hardware.agreements.lender_or_proxy'), align: :center
      end
    end

    def print_paragraphs(type = :rental)
      if type == :rental
        print_paragraph_number_1(rental_paragraph_number_1)
      elsif type == :return
        print_paragraph_number_1(return_paragraph_number_1)
      end

      print_paragraph_number_2(type)
      print_paragraph_number_3(type)
    end

    def print_paragraph_number_1(paragraph)
      @pdf.move_down 10
      @pdf.text '§ 1.', align: :center, style: :bold
      @pdf.text paragraph
      @pdf.move_down 10
      @devices.each_with_index { print_hardware_info(_1, _2) }
    end

    def print_paragraph_number_2(type)
      @pdf.start_new_page if @pdf.cursor < 60
      @pdf.text '§ 2.', align: :center, style: :bold
      @pdf.move_down 5
      point = I18n.t("apps.hardware.#{type}_agreement.point")
      points = (1..@devices.count).to_a.map { |el| "#{point} #{el}" }.join(', ')
      @pdf.text I18n.t("apps.hardware.#{type}_agreement.paragraph_number_2", points: points)
      @pdf.move_down 15
    end

    def print_paragraph_number_3(type)
      @pdf.start_new_page if @pdf.cursor < 120
      @pdf.text '§ 3.', align: :center, style: :bold
      @pdf.move_down 5
      I18n.t("apps.hardware.#{type}_agreement.paragraph_number_3", bullet: '•').split('<br>').each do |paragraph|
        @pdf.text paragraph
      end
      @pdf.move_down 30
    end

    def print_company(company)
      @pdf.text company.name, style: :bold
      @pdf.text company.address
      @pdf.text [company.zip_code, company.city].join(' ')
      @pdf.text "#{I18n.t('apps.hardware.agreements.nip')}: #{company.nip}"
      @pdf.text ['KRS:', company.krs].join(' ')
    end

    def print_lenders(lenders)
      @pdf.text I18n.t('apps.hardware.agreements.represented_by')
      lenders.each do |lender|
        @pdf.text lender.to_s, style: :bold
      end
      @pdf.text I18n.t('apps.hardware.agreements.referred_to_as', data: I18n.t('apps.hardware.agreements.lender').upcase), style: :bold
    end

    def print_borrower(borrower)
      @pdf.text I18n.t('apps.hardware.agreements.and')
      @pdf.text "#{I18n.t('apps.hardware.agreements.name_and_surname')} #{borrower.first_name} #{borrower.last_name}", style: :bold
      @pdf.text I18n.t('apps.hardware.agreements.address'), style: :bold
      @pdf.text 'PESEL: ..........................', style: :bold
      @pdf.text I18n.t('apps.hardware.agreements.id_document'), style: :bold
      @pdf.text I18n.t('apps.hardware.agreements.referred_to_as', data: I18n.t('apps.hardware.agreements.borrower').upcase), style: :bold
    end
  end
end
