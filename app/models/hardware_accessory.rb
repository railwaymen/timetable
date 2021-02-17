# frozen_string_literal: true

class HardwareAccessory < ApplicationRecord
  belongs_to :hardware

  validates :name, presence: true, uniqueness: { scope: :hardware }
end
