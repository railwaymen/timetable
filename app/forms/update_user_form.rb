# frozen_string_literal: true

class UpdateUserForm
  include ActiveModel::Model

  attr_accessor :user, :email, :first_name, :last_name, :phone, :contract_name, :lang, :active, :birthdate

  def initialize(attributes = {})
    super
    @attributes = attributes
  end

  def save
    user.update(@attributes.slice(:email, :first_name, :last_name, :phone, :contract_name, :lang, :birthdate))
    active ? user.undiscard : user.discard
  end
end
