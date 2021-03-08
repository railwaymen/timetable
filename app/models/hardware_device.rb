# frozen_string_literal: true

class HardwareDevice < ApplicationRecord
  include Discard::Model

  validates :brand, :model, :serial_number, :year_of_production, :year_bought, :used_since, :category, :device_type, presence: true
  validate :unique_serial_number

  has_paper_trail
  belongs_to :user, optional: true
  has_many :accessories, class_name: 'HardwareDeviceAccessory', dependent: :destroy
  has_many_attached :images

  enum category: {
    computers: 'computers',
    displays: 'displays',
    mobile_phones: 'mobile_phones',
    tablets: 'tablets',
    other: 'other'
  }

  accepts_nested_attributes_for :accessories, allow_destroy: true

  scope :active, -> { where(archived: false, discarded_at: nil) }
  scope :archived, -> { where(archived: true, discarded_at: nil) }

  def unique_serial_number
    return unless HardwareDevice.where.not(id: id).exists?(category: category, serial_number: serial_number)

    errors.add(:serial_number, 'serial_number_exists')
  end

  def self.search(phrase) # rubocop:disable Metrics/MethodLength
    SearchQuery.new(
      all.joins(:user),
      extend_columns_with: %w[first_name last_name]
    ).ilike(
      names: [
        'users.first_name',
        'users.last_name',
        :brand,
        :model,
        :serial_number,
        :category,
        :os_version,
        :state
      ],
      values: phrase.split(' ')
    ).execute
  end
end
