# frozen_string_literal: true

# rubocop:disable Metrics/MethodLength

require 'net/ldap'
require 'devise/strategies/authenticatable'

module Devise
  module Strategies
    class LdapAuthenticatable < Authenticatable
      LDAP_ASTERISK_SIGN = '\2a'

      def authenticate!
        return false unless params[:user]

        ldap = Net::LDAP.new(host: Rails.application.secrets.ldap[:host], port: Rails.application.secrets.ldap[:port],
                             auth: { method: :simple, username: "uid=#{email},#{Rails.application.secrets.ldap[:base]}", password: password })

        ldap_filter = Net::LDAP::Filter.eq('uid', email) & (Net::LDAP::Filter.eq('host', LDAP_ASTERISK_SIGN) | Net::LDAP::Filter.eq(*Rails.application.secrets.ldap[:matched_value]))

        search_attributes = {
          base: Rails.application.secrets.ldap[:base],
          filter: ldap_filter,
          attributes: %w[host dn givenname sn mail]
        }

        return fail! unless ldap.bind && ldap.search(search_attributes).present?

        entry = ldap.search(search_attributes).first

        ldap_attributes = {
          first_name: entry.givenname.first,
          last_name: entry.sn.first,
          email: entry.mail.first
        }

        user = User.where(email: ldap_attributes[:email]).first_or_create!(first_name: ldap_attributes[:first_name], last_name: ldap_attributes[:last_name])
        success!(user)
      end

      def email
        params[:user][:email]
      end

      def password
        params[:user][:password]
      end
    end
  end
end

Warden::Strategies.add(:ldap_authenticatable, Devise::Strategies::LdapAuthenticatable)

# rubocop:enable Metrics/MethodLength
