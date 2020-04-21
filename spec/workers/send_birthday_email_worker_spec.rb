# frozen_string_literal: true

require 'rails_helper'

describe SendBirthdayEmailWorker do
  describe '#perform' do
    it 'calls send_birthday_email BirthdayMailer action' do
      user = create(:user)
      template = create(:birthday_email_template)
      double_mailer = double(BirthdayMailer)

      expect(BirthdayMailer).to receive(:with).with(title: template.title, header: template.header, body: template.body, bottom: template.bottom).and_return(double_mailer)
      expect(double_mailer).to receive(:send_birthday_email).and_return(double_mailer)
      expect(double_mailer).to receive(:deliver_later)
      SendBirthdayEmailWorker.new.perform(user.name, template.id)
    end
  end
end
