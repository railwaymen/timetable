# frozen_string_literal: true

class HardwareMailerPreview < ActionMailer::Preview
  def send_agreement_to_accountancy
    generator = Agreements::ReturnAgreementGeneratorService.new(Hardware.first(5), { company_id: Company.last.id })
    pdf = generator.generate
    HardwareMailer.send_agreement_to_accountancy(User.first, pdf, 'return')
  end
end
