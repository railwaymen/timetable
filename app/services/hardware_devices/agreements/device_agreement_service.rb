# frozen_string_literal: true

require 'prawn'

module HardwareDevices
  module Agreements
    class DeviceAgreementService
      include ::Agreements::PdfSettings
      include ::Agreements::PdfFields
      include ActionView::Helpers::NumberHelper

      attr_reader :devices, :company_id, :borrower_id, :type

      def initialize(*devices, company_id: nil, borrower_id: nil, type: :rental)
        @pdf = Prawn::Document.new

        @devices = devices
        @company_id = company_id
        @borrower_id = borrower_id
        @type = type
      end

      def company
        @company ||= Company.find(company_id) if company_id
      end

      def borrower
        @borrower ||= User.find(borrower_id) if borrower_id
      end

      def generate
        font_settings

        generate_pdf

        @pdf.render
      end

      private

      def generate_pdf
        print_header
        parties_to_the_agreeement
        print_paragraphs(type)
        print_singatures
      end

      def print_hardware_info(device, index)
        @pdf.text "#{index + 1}. #{I18n.t("apps.hardware.types.#{device.category}")}", style: :bold
        @pdf.text "#{I18n.t('apps.hardware.brand')}: <b>#{device.brand}</b>", inline_format: true
        @pdf.text "#{I18n.t('apps.hardware.model').upcase}: <b>#{device.model}</b>", inline_format: true
        @pdf.text "#{I18n.t('apps.hardware.serial_number').upcase}: <b>#{device.serial_number}</b>", inline_format: true
        @pdf.text "#{I18n.t('apps.hardware.physical_condition').upcase}: <b>#{I18n.t('apps.hardware_devices.' + device.state)}</b>", inline_format: true
        print_additional_hardware_info(device)
        print_hardware_accessories(device.accessories)
        @pdf.text I18n.t('apps.hardware.agreements.total_value', price: number_to_currency(device.price, unit: '', separator: ',', delimiter: ' ')), inline_format: true
        @pdf.move_down 15
      end

      def print_additional_hardware_info(hardware)
        @pdf.text I18n.t('apps.hardware.agreements.additional_info').upcase

        @pdf.text "#{I18n.t('apps.hardware.year_of_production')}: #{hardware.year_of_production&.strftime('%Y')}"
        @pdf.text "#{I18n.t('apps.hardware.year_bought')}: #{hardware.year_bought&.strftime('%Y')}"
        @pdf.text "#{I18n.t('apps.hardware.cpu')}: #{hardware.cpu}"
        @pdf.text "#{I18n.t('apps.hardware.ram')}: #{hardware.ram}"
        @pdf.text "#{I18n.t('apps.hardware.storage')}: #{hardware.storage}"
      end

      def agreement_title
        I18n.t("apps.hardware.#{type}_agreement.title")
      end

      def print_hardware_accessories(hardware_accessories)
        if hardware_accessories.exists?
          @pdf.text "#{I18n.t('apps.hardware.accessories').upcase}:"
          hardware_accessories.each_with_index do |hardware_accessory, index|
            @pdf.text "#{I18n.t('apps.hardware.accessory')} ##{index + 1}: #{hardware_accessory.name}"
          end
        else
          @pdf.text I18n.t('apps.hardware.no_accessories'), style: :bold
        end
      end

      def parties_to_the_agreeement
        @pdf.text I18n.t('apps.hardware.agreements.agreement_between', date: Time.current.to_date.strftime('%d.%m.%Y')), inline_format: true
        print_company(company)
        print_lenders(company.lenders)
        print_borrower(borrower)
      end
    end
  end
end
