# frozen_string_literal: true

require 'logger'

module ExternalAuthStrategy
  class LoggerDecorator < SimpleDelegator
    def initialize(strategy, name)
      super(strategy)
      @name = name
      @logger = Logger.new("#{Rails.root}/log/#{name}_auth.log")
    end

    %i[update set_access_token integration_payload init_access_token prepare_request_data authorization_url token secret data request_data].each do |method|
      define_method method do |*args|
        begin
          result = super(*args)
          logger.info("#{name} auth returns #{result.inspect} after calling #{method} with #{args.inspect}")
          result
        rescue StandardError => e
          logger.info("#{name} auth raised #{e.inspect} after calling #{method} with #{args.inspect}")
          raise e
        end
      end
    end

    private

    attr_reader :logger, :name
  end
end
