# frozen_string_literal: true

class Hardware < ApplicationRecord
  STATUS_TRANSITIONS = {
    in_office: %i[loaning],
    loaning: %i[loaned in_office],
    loaned: %i[returning],
    returning: %i[in_office loaned]
  }.freeze

  belongs_to :user
  has_many :hardware_fields, dependent: :destroy
  has_many :hardware_accessories, dependent: :destroy

  enum type: {
    screen: 'screen',
    laptop: 'laptop',
    pc: 'pc',
    tablet: 'tablet',
    smartphone: 'smartphone'
  }

  enum status: {
    loaned: 'loaned',
    in_office: 'in_office',
    loaning: 'loaning',
    returning: 'returning'
  }

  validates :serial_number, presence: true, uniqueness: true
  validates :model, :type, :manufacturer, :status, :physical_condition, :functional_condition, presence: true
  validate :validate_status_transition, on: :update, if: -> { status_changed? }

  def self.inheritance_column
    nil
  end

  def validate_status_transition
    errors.add(:status, :wrong_transition) unless STATUS_TRANSITIONS[status_was.to_sym || :in_office].include?(status.to_sym)
  end
end
