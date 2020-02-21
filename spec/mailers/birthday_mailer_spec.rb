# frozen_string_literal: true

require 'rails_helper'

RSpec.describe BirthdayMailer, type: :mailer do
  describe 'send ticket' do
    let(:user) { create(:user) }
    let(:template) { create :birthday_email_template }
    let(:mail) { BirthdayMailer.send_birthday_email(template.title, template.body) }

    it 'renders the headers' do
      expect(mail.subject).to eql(template.title)
      expect(mail.to).to eql([Rails.application.secrets.birthday_mailer_to])
      expect(mail.from).to eq([Rails.application.secrets.mailer[:from]].compact)
    end

    it 'renders the body' do
      expect(mail.body.encoded).to match(template.body)
    end
  end
end
