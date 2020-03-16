# frozen_string_literal: true

require 'rails_helper'

RSpec.describe VacationMailer, type: :mailer do
  describe '#send_information_to_accountancy' do
    it 'sends email' do
      vacation = create(:vacation)
      mailer = VacationMailer.new
      title = "[Urlop] #{vacation.user} #{vacation.start_date.strftime('%d/%m/%Y')} - #{vacation.end_date.strftime('%d/%m/%Y')}"
      expect(mailer).to receive(:mail).with(to: Rails.application.secrets[:vacation_mailer_to], subject: title, content_type: 'text/html')

      mailer.send_information_to_accountancy(vacation)
    end
  end
end
