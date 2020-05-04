# frozen_string_literal: true

class Hardware < ApplicationRecord
  belongs_to :user
  has_many :hardware_fields, dependent: :destroy

  enum type: {
    screen: 'screen',
    laptop: 'laptop',
    pc: 'pc'
  }
  validates :serial_number, presence: true, uniqueness: true
  validates :model, :type, :manufacturer, presence: true
  def self.inheritance_column
    nil
  end
end
