# frozen_string_literal: true

require 'external_auth_strategy/logger_decorator'

module ExternalAuthStrategy
  module_function

  def init_from_data(name, data)
    LoggerDecorator.new(
      const_get(name).from_data(data),
      name
    )
  end

  def init(name, params)
    LoggerDecorator.new(
      const_get(name).new(params),
      name
    )
  end
end
