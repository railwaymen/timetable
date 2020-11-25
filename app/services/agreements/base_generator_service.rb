# frozen_string_literal: true

require 'prawn'
require 'prawn/table'
require 'tempfile'
require 'uri'

module Agreements
  class BaseGeneratorService
    FONT_PATH = Rails.root.join('app/assets/fonts')

    def initialize(hardwares, params)
      @hardwares = hardwares
      @params = params
      @pdf = Prawn::Document.new
    end

    def generate
      font_settings

      generate_pdf

      @pdf.render
    end

    private

    def font_settings
      @pdf.font_families.update('Roboto' => {
        normal: 'Roboto-Regular.ttf',
        bold: 'Roboto-Bold.ttf',
        italic: 'Roboto-Italic.ttf',
        bold_italic: 'Roboto-BoldItalic.ttf'
      }.transform_values(&method(:font_path)))
      @pdf.font 'Roboto'
      @pdf.font_size 11
      @pdf.default_leading 6
    end

    def generate_pdf
      print_header
      PartiesToTheAgreementGeneratorService.new(@pdf, @params).print_parties_to_the_agreement
      print_paragraphs
      print_singatures
    end

    def print_header
      @pdf.text 'Kraków, ................', align: :right
      @pdf.text agreement_title, align: :center, style: :bold
      @pdf.move_down 20
    end

    def print_paragraphs
      print_paragraph_number_1
      print_the_remaining_paragraphs
    end

    def print_paragraph_number_1
      @pdf.move_down 10
      @pdf.text '§ 1.', align: :center, style: :bold
      @pdf.text paragraph_number_1
      @pdf.move_down 10
      @hardwares.each_with_index { |hardware, index| print_hardware_info(hardware, index) }
    end

    def print_hardware_info(hardware, index)
      @pdf.text "#{index + 1}. #{I18n.t("apps.hardware.types.#{hardware.type}")}", style: :bold
      @pdf.text "#{I18n.t('apps.hardware.manufacturer').upcase}: <b>#{hardware.manufacturer}</b>", inline_format: true
      @pdf.text "#{I18n.t('apps.hardware.model').upcase}: <b>#{hardware.model}</b>", inline_format: true
      @pdf.text "#{I18n.t('apps.hardware.serial_number').upcase}: <b>#{hardware.serial_number}</b>", inline_format: true
      @pdf.text "#{I18n.t('apps.hardware.physical_condition').upcase}:\n <b>#{hardware.physical_condition}</b>", inline_format: true
      @pdf.text "#{I18n.t('apps.hardware.functional_condition').upcase}:\n <b>#{hardware.functional_condition}</b>", inline_format: true
      print_additional_hardware_info(hardware.hardware_fields) if hardware.hardware_fields.exists?
      print_hardware_accessories(hardware.hardware_accessories)
      @pdf.text I18n.t('apps.hardware.agreements.total_value'), inline_format: true
      @pdf.move_down 15
    end

    def print_additional_hardware_info(hardware_fields)
      @pdf.text I18n.t('apps.hardware.agreements.additional_info').upcase
      hardware_fields.each do |hardware_field|
        @pdf.text "#{hardware_field.name}: #{hardware_field.value}"
      end
    end

    def print_hardware_accessories(hardware_accessories)
      if hardware_accessories.exists?
        @pdf.text "#{I18n.t('apps.hardware.accessories').upcase}:"
        hardware_accessories.each_with_index do |hardware_accessory, index|
          @pdf.text "#{I18n.t('apps.hardware.accessory')} ##{index}: #{hardware_accessory.name}"
        end
      else
        @pdf.text I18n.t('apps.hardware.no_accessories'), style: :bold
      end
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

    def font_path(font)
      File.join(FONT_PATH, font)
    end
  end
end
