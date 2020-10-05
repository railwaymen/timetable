# frozen_string_literal: true

class CustomLogrageFormatter < Lograge::Formatters::KeyValue
  KEYS_ORDER = %i[time method path params status format controller action duration view db].freeze

  def call(data)
    fields_to_display(data)
      .sort_by { |key| KEYS_ORDER.index(key) || 9999 }
      .map { |key| format(key, data[key]) }
      .join(' ')
  end
end

Rails.application.configure do
  config.lograge.formatter = CustomLogrageFormatter.new

  config.lograge.custom_payload do |controller|
    if controller.response_code == 422 && controller.media_type == 'application/json'
      {
        body: controller.response.body
      }
    end
  end

  config.lograge.custom_options = lambda do |event|
    {
      user_id: event.payload[:user_id],
      params: event.payload[:params].except('controller', 'action', 'format'),
      time: Time.zone.now.strftime('%Y-%m-%d %H:%M:%S'),
      body: event.payload[:body]
    }.reject { |_, value| value.blank? }
  end
end
