# frozen_string_literal: true

require 'rails_helper'

describe BirthdayMailerPreview do
  let(:user) { create(:user) }

  it 'calls mailer with stubbed values' do
    create(:user)
    template = create(:birthday_email_template)
    mailer_double = instance_double(BirthdayMailer)

    expect(BirthdayMailer).to receive(:with).with(title: template.title, header: template.header, body: template.body, bottom: template.bottom).and_return(mailer_double)
    expect(mailer_double).to receive(:send_birthday_email)
    BirthdayMailerPreview.new.send_birthday_email
  end
end
