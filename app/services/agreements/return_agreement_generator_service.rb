# frozen_string_literal: true

module Agreements
  class ReturnAgreementGeneratorService < BaseGeneratorService
    private

    def agreement_title
      I18n.t('apps.hardware.return_agreement.title')
    end

    def paragraph_number_1
      I18n.t('apps.hardware.return_agreement.paragraph_number_1')
    end

    def print_the_remaining_paragraphs
      print_paragraph_number_2
      print_paragraph_number_3
    end

    def print_paragraph_number_2
      @pdf.start_new_page if @pdf.cursor < 60
      @pdf.text '§ 2.', align: :center, style: :bold
      @pdf.move_down 5
      point = I18n.t('apps.hardware.return_agreement.point')
      points = (1..@hardwares.count).to_a.map { |el| "#{point} #{el}" }.join(', ')
      I18n.t('apps.hardware.return_agreement.paragraph_number_2', points: points, bullet: '•').split('<br>').each do |paragraph|
        @pdf.text paragraph
      end
      @pdf.move_down 15
    end

    def print_paragraph_number_3
      @pdf.start_new_page if @pdf.cursor < 120
      @pdf.text '§ 3.', align: :center, style: :bold
      @pdf.move_down 5
      @pdf.text I18n.t('apps.hardware.return_agreement.paragraph_number_3')
      @pdf.move_down 30
    end
  end
end
