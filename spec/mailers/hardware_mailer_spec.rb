# frozen_string_literal: true

require 'rails_helper'

RSpec.describe HardwareMailer, type: :mailer do
  describe '#send_agreement_to_accountancy' do
    it 'sends email' do
      user = create(:user)
      hardware = create(:hardware, user: user)
      create(:hardware_field, hardware: hardware, name: 'Example Field', value: 'Example Value')
      create(:hardware_accessory, hardware: hardware, name: 'Example Accessory')
      company = create(:company)
      create(:lender, company: company)
      generator = Agreements::RentalAgreementGeneratorService.new(Hardware.all, { company_id: company.id })
      pdf = generator.generate
      mailer = described_class.new
      title = "#{I18n.t('apps.hardware.mailer.title', action: 'Rental')} #{user}"
      expect(mailer).to receive(:mail).with(to: Rails.application.secrets[:accountancy_mail], subject: title, content_type: 'text/html')

      mailer.send_agreement_to_accountancy(user, pdf, 'rental')
    end
  end
end
