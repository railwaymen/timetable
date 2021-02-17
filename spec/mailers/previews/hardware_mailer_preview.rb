# frozen_string_literal: true

class HardwareMailerPreview < ActionMailer::Preview
  def send_agreement_to_accountancy
    generator = Agreements::ReturnAgreementGeneratorService.new(Hardware.first(5), { lender_id: Lender.last.id })
    pdf = generator.generate
    HardwareMailer.send_agreement_to_accountancy(User.first, pdf, 'return')
  end
end
