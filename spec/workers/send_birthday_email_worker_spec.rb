# frozen_string_literal: true

require 'rails_helper'

describe SendBirthdayEmailWorker do
  describe '#perform' do
    it 'calls send_birthday_email BirthdayMailer action' do
      user = create(:user)
      template = create(:birthday_email_template)
      double_mailer = double(BirthdayMailer)

      expect(BirthdayMailer).to receive(:send_birthday_email).with(template.title, template.body).and_return(double_mailer)
      expect(double_mailer).to receive(:deliver_later)
      SendBirthdayEmailWorker.new.perform(user.to_s, template.id)
    end
  end
end
