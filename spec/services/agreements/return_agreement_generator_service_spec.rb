# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Agreements::ReturnAgreementGeneratorService do
  describe '#generate' do
    it 'generates return agreement' do
      user = create(:user)
      hardware = create(:hardware, user: user)
      hardware_field = create(:hardware_field, hardware: hardware, name: 'Example Field', value: 'Example Value')
      company = create(:company)
      lender = create(:lender, company: company)
      generator = described_class.new(Hardware.all, { lender_id: lender.id })
      pdf = generator.generate
      parsed_pdf = PDF::Inspector::Text.analyze(pdf).strings.join(' ')
      expect(parsed_pdf).to include(lender.to_s)
      expect(parsed_pdf).to include(company.name)
      expect(parsed_pdf).to include(hardware.model)
      expect(parsed_pdf).to include("#{hardware_field.name}: #{hardware_field.value}")
    end
  end
end
