# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Agreements::RentalAgreementGeneratorService do
  describe '#generate' do
    it 'generates rental agreement' do
      user = create(:user)
      hardware = create(:hardware, user: user)
      hardware_field = create(:hardware_field, hardware: hardware, name: 'Example Field', value: 'Example Value')
      hardware_accessory = create(:hardware_accessory, hardware: hardware, name: 'Example Accessory')
      company = create(:company)
      lender = create(:lender, company: company)
      generator = described_class.new(Hardware.all, { company_id: company.id })
      pdf = generator.generate
      parsed_pdf = PDF::Inspector::Text.analyze(pdf).strings.join(' ')
      expect(parsed_pdf).to include(lender.to_s)
      expect(parsed_pdf).to include(company.name)
      expect(parsed_pdf).to include(hardware.model)
      expect(parsed_pdf).to include("#{hardware_field.name}: #{hardware_field.value}")
      expect(parsed_pdf).to include("#1: #{hardware_accessory.name}")
    end
  end
end
