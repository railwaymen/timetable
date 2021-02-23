# frozen_string_literal: true

module Agreements
  class RentalAgreementGeneratorService < BaseGeneratorService
    def agreement_title
      I18n.t('apps.hardware.rental_agreement.title')
    end

    def paragraph_number_1
      I18n.t('apps.hardware.rental_agreement.paragraph_number_1')
    end

    def print_the_remaining_paragraphs
      (2..8).each do |i|
        @pdf.start_new_page if @pdf.cursor < 60 || (@pdf.cursor < 120 && i == 8)
        @pdf.text "§ #{i}", align: :center, style: :bold
        @pdf.move_down 5
        @pdf.text I18n.t("apps.hardware.rental_agreement.paragraph_number_#{i}", bullet: "<b>\u2022</b>"), inline_format: true
        @pdf.move_down 15
      end
      @pdf.move_down 15
    end
  end
end
