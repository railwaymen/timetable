# frozen_string_literal: true

require 'rails_helper'

describe NotifyOffEmployees do
  it 'call webhook with users which are on vacation today' do
    url = 'https://example.com'
    credentials = {
      enabled: true,
      url: url
    }
    expect(Rails.application.secrets).to receive(:employee_vacation_notifier).twice.and_return(credentials)

    user1 = create(:user)
    user2 = create(:user)
    create(:vacation, user: user1, status: :accepted, start_date: Time.zone.today, end_date: 4.days.from_now)
    create(:vacation, user: user2, status: :accepted, start_date: 1.day.from_now, end_date: 4.days.from_now)

    params = {
      payload: {
        username: :vacationbot,
        text: "#{user1.name} is off today"
      }.to_json
    }
    response = double(code: '200')
    expect(Net::HTTP).to receive(:post_form).with(URI(url), params).and_return(response)
    described_class.call
  end
end
