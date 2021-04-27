# frozen_string_literal: true

class NotifyOffEmployees
  class << self
    def call
      return unless Rails.application.secrets.employee_vacation_notifier[:enabled]

      users = users_on_vacation_today

      return if users.empty?

      notify_for_users(users)
    end

    def users_on_vacation_today
      User.joins(:vacations).where(vacations: { status: :accepted }).where('vacations.business_days_count < 30')
          .where('vacations.start_date <= ? AND vacations.end_date >= ?', Time.zone.today, Time.zone.today).map(&:name)
    end

    def notify_for_users(users)
      sentence = users.one? ? ' is off today' : ' are off today'
      params = {
        payload: {
          username: :vacationbot,
          text: users.join(', ') + sentence
        }.to_json
      }

      Net::HTTP.post_form(URI(webhook_url), params).tap do |response|
        raise StandardError, 'Invalid response from webhook' if response.code != '200'
      end
    end

    def webhook_url
      Rails.application.secrets.employee_vacation_notifier[:url]
    end
  end
end
